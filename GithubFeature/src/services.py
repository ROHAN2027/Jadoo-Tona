import re
import PyPDF2
from typing import Dict, List, Optional


def extract_resume_info(pdf_path: str) -> Dict[str, Optional[str | List[str]]]:
    result = {
        'name': None,
        'email': None,
        'github_links': []
    }
    
    try:
        text = extract_text_from_pdf(pdf_path)
        result['name'] = extract_name(text)
        result['email'] = extract_email(text)
        result['github_links'] = extract_github_links_from_annotations(pdf_path)
        
        if not result['github_links']:
            result['github_links'] = extract_github_links(text)
    except Exception as e:
        print(f"Error processing PDF: {e}")
    
    return result


def extract_text_from_pdf(pdf_path: str) -> str:
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        raise Exception(f"Failed to read PDF: {e}")
    
    return text


def extract_github_links_from_annotations(pdf_path: str) -> List[str]:
    github_links = []
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            for page in pdf_reader.pages:
                if '/Annots' in page:
                    annotations = page['/Annots']
                    
                    for annotation in annotations:
                        obj = annotation.get_object()
                        
                        if '/A' in obj:
                            action = obj['/A']
                            if '/URI' in action:
                                uri = action['/URI']
                                if 'github.com' in uri.lower():
                                    if '/' in uri.split('github.com/')[-1]:
                                        if uri not in github_links:
                                            github_links.append(uri)
    except Exception as e:
        print(f"Error extracting annotations: {e}")
    
    return github_links


def extract_email(text: str) -> Optional[str]:
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    return emails[0] if emails else None


def extract_name(text: str) -> Optional[str]:
    lines = text.strip().split('\n')
    lines = [line.strip() for line in lines if line.strip()]
    
    if not lines:
        return None
    
    for line in lines[:5]:
        if any(keyword in line.lower() for keyword in 
               ['resume', 'cv', 'curriculum', 'profile', 'contact', 
                'email', 'phone', 'address', 'objective', 'summary']):
            continue
        
        if '@' in line or 'http' in line.lower() or 'www.' in line.lower():
            continue
        
        words = line.split()
        if len(words) >= 2 and len(words) <= 4:
            if all(word.replace('.', '').replace(',', '').isalpha() 
                   for word in words if word):
                return line
    
    return lines[0] if lines else None


def extract_github_links(text: str) -> List[str]:
    github_links = []
    
    patterns = [
        r'https?://(?:www\.)?github\.com/[\w-]+/[\w.-]+',
        r'(?:www\.)?github\.com/[\w-]+/[\w.-]+',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        github_links.extend(matches)
    
    cleaned_links = []
    for link in github_links:
        link = link.strip('.,;:!?)\']}">')
        
        if not link.startswith('http'):
            link = 'https://' + link
        
        link = link.rstrip('/')
        
        if link not in cleaned_links:
            cleaned_links.append(link)
    
    return cleaned_links



if __name__ == "__main__":
    pdf_file = "MNIT_JAIPUR_2023UA1809.pdf"
    info = extract_resume_info(pdf_file)
    
    print("=" * 50)
    print("RESUME INFORMATION")
    print("=" * 50)
    print(f"Name: {info['name']}")
    print(f"Email: {info['email']}")
    print(f"GitHub Links: {len(info['github_links'])} found")
    for i, link in enumerate(info['github_links'], 1):
        print(f"  {i}. {link}")
    print("=" * 50)
