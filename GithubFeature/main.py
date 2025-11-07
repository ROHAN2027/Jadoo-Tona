from dotenv import load_dotenv

# Load environment variables FIRST, before any other imports
load_dotenv()

from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import requests
import os
import json
import google.generativeai as genai  # <-- Import Gemini
from bs4 import BeautifulSoup

# Import voice service router (after load_dotenv)
from voice_service import router as voice_router

# Resume parsing helper
from src.services import extract_resume_info


app = FastAPI(title="Sarthi AI Services API")

# Include voice service routes
app.include_router(voice_router)

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "services": {
            "gemini": bool(os.getenv("GOOGLE_API_KEY")),
            "groq": bool(os.getenv("GROQ_API_KEY")),
            "github_token": bool(os.getenv("GITHUB_TOKEN"))
        }
    }

@app.post('/parse-resume')
async def parse_resume(file: UploadFile = File(...)):
    """Accept a PDF upload and return parsed resume fields as JSON.
    "curl -X POST "http://127.0.0.1:8000/parse-resume" -F "file=@C:\path\to\resume.pdf"
    Uses src.services.extract_resume_info which expects a file path, so the
    uploaded file is saved temporarily and removed after processing.
    
    Returns:
        {
            "name": str | null,
            "email": str | null,
            "github_links": list[str]
        }
    """
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail='Only PDF uploads are supported')

    import tempfile, os

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name

        parsed = extract_resume_info(tmp_path)

        try:
            os.unlink(tmp_path)
        except Exception:
            # Not critical if cleanup fails
            pass

        # Ensure proper JSON serialization with explicit types
        result = {
            "name": parsed.get("name"),
            "email": parsed.get("email"),
            "github_links": parsed.get("github_links", [])
        }
        
        return result

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

# --- Gemini API Configuration ---
# Make sure you set this environment variable
# export GOOGLE_API_KEY="your_api_key_here"
try:
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
except AttributeError:
    raise RuntimeError("GOOGLE_API_KEY environment variable not set.")


class RepoRequest(BaseModel):
    repo_url: str

@app.post("/generate-questions")
def generate_questions(data: RepoRequest):
    try:
        repo_url = data.repo_url
        owner, repo = extract_owner_repo(repo_url)
        
        # Step 1: Fetch repo contents
        readme_content = fetch_file_content(owner, repo, "README.md")
        key_files = fetch_key_files(owner, repo)

        combined_text = (readme_content or "") + "\n\n".join(key_files.values())

        # Step 2: Clean text
        cleaned_text = BeautifulSoup(combined_text, "html.parser").get_text()
        
        # We can use a much larger context with Gemini 1.5
        context_limit = 500000 
        
        if not cleaned_text.strip():
            raise HTTPException(status_code=400, detail="Could not fetch or read repository content.")

        # Step 3: --- Swapped to Gemini ---
        
        # Instantiate the model
        # Use 'gemini-1.5-pro' for the highest quality analysis
        # Use 'gemini-1.5-flash' for faster, cheaper responses
        model = genai.GenerativeModel('gemini-2.5-flash')

        # Generate the new, detailed prompt
        prompt = create_detailed_prompt(cleaned_text[:context_limit])

        # Generate content
        response = model.generate_content(prompt)

        # Extract the text
        questions = response.text.strip()
        
        return {"questions": questions}

    except Exception as e:
        # Catch potential Gemini API errors (e.g., safety blocks)
        if 'response' in locals() and not response.parts:
             raise HTTPException(status_code=500, detail=f"Content generation blocked. Feedback: {response.prompt_feedback}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-project-interview")
def generate_project_interview(data: RepoRequest):
    """
    Generate structured interview questions for voice/project interview module.
    Returns JSON with metadata for each question (category, difficulty, key points).
    """
    try:
        repo_url = data.repo_url
        owner, repo = extract_owner_repo(repo_url)
        
        # Step 1: Fetch repo contents
        readme_content = fetch_file_content(owner, repo, "README.md")
        key_files = fetch_key_files(owner, repo)

        combined_text = (readme_content or "") + "\n\n".join(key_files.values())

        # Step 2: Clean text
        cleaned_text = BeautifulSoup(combined_text, "html.parser").get_text()
        
        context_limit = 500000 
        
        # If no content, provide minimal context
        if not cleaned_text.strip():
            cleaned_text = f"GitHub Repository: {owner}/{repo}\nNo README or source files could be accessed. Generate general software engineering questions."
            print(f"Warning: No content fetched for {owner}/{repo}, using fallback")

        # Step 3: Generate structured questions with Gemini
        model = genai.GenerativeModel(
            'gemini-2.5-flash',
            generation_config={
                'temperature': 0.7,
                'response_mime_type': 'application/json'
            }
        )

        prompt = create_structured_interview_prompt(cleaned_text[:context_limit])

        # Generate content
        response = model.generate_content(prompt)
        
        # Parse JSON response
        questions_data = json.loads(response.text)
        
        # Validate structure
        if not isinstance(questions_data, dict) or 'questions' not in questions_data:
            raise ValueError("Invalid response format from AI")
        
        # Add repo metadata
        questions_data['repo_url'] = repo_url
        questions_data['repo_name'] = f"{owner}/{repo}"
        questions_data['analyzed_files'] = list(key_files.keys()) if key_files else []
        
        return questions_data

    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {str(e)}")
        print(f"Raw response: {response.text if 'response' in locals() else 'No response'}")
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except ValueError as e:
        print(f"Validation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"Error in generate_project_interview: {str(e)}")
        if 'response' in locals() and hasattr(response, 'prompt_feedback'):
            raise HTTPException(status_code=500, detail=f"Content generation blocked. Feedback: {response.prompt_feedback}")
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")


def create_detailed_prompt(context: str) -> str:
    """
    Creates a detailed, few-shot prompt for generating high-quality
    interview questions.
    """
    return f"""
    You are a senior technical interviewer and staff-level architect.
    Your task is to analyze the provided GitHub project context (README and source code) and generate 5 insightful, open-ended technical interview questions for a candidate who claims to have built this project.

    *Instructions:*
    1.  *Be Specific:* The questions MUST relate directly to the provided code, libraries (e.g., pandas, fastapi, react), and design patterns. Avoid generic questions.
    2.  *Focus on "Why":* Probe the candidate's understanding of their own design choices, trade-offs, and potential limitations.
    3.  *Cover Key Areas:* Generate questions that touch on:
        * Architectural/Design Choices
        * Scalability and Performance
        * Robustness and Error Handling
        * Potential Challenges and Future Improvements
        * Security Considerations (if applicable)

    *Example of Good Questions (for a *different project):**
    * *(Design Choice):* "I see you used WebSockets for the chat feature. What was your reasoning for choosing WebSockets over long-polling or Server-Sent Events (SSE) in this specific application?"
    * *(Trade-off):* "You're using a MongoDB (NoSQL) database. Can you describe a scenario where a relational (SQL) database might have been a better choice for this project's data model?"
    * *(Scalability):* "Looking at your main.py, the service seems to be monolithic. How would you refactor this to handle 10,000 concurrent users? What would be the first bottleneck you'd expect?"
    * *(Robustness):* "What kind of failures did you consider? For example, what happens if the external API you're calling on line 50 becomes unavailable or returns a 500 error? How would you handle that gracefully?"
    * *(Improvement):* "If you had another week on this project, what's the first major piece of technical debt you would address or the first new feature you would build, and what would your implementation plan look like?"

    *Output Format:*
    Please provide only the 5 questions in a numbered list. Do not add any preamble like "Here are your questions:".

    ---
    *Project Context to Analyze:*

    {context}
    """


def create_structured_interview_prompt(context: str) -> str:
    """
    Creates a prompt for generating structured interview questions with metadata.
    Returns questions in JSON format with category, difficulty, and expected key points.
    """
    return f"""
You are a senior technical interviewer analyzing a GitHub project to create interview questions.

**Task:** Generate exactly 5 technical interview questions for a candidate who claims to have built this project.

**Project Context:**
{context}

**Requirements:**
1. Questions MUST be specific to this project's code, architecture, and technology choices
2. Cover diverse aspects: architecture, design decisions, scalability, error handling, trade-offs
3. Each question should probe understanding, not just recall
4. Questions should be answerable in 1-2 minutes of speaking

**Output Format (JSON):**
{{
  "questions": [
    {{
      "question": "Why did you choose MongoDB over a relational database for this project?",
      "category": "Architecture & Design",
      "difficulty": "Medium",
      "expectedKeyPoints": [
        "Document-based data model flexibility",
        "Schema-less design benefits",
        "Scalability considerations",
        "Performance trade-offs"
      ],
      "context": "Related to database choice in backend/utils/db.js"
    }},
    {{
      "question": "How would you handle authentication if this scaled to 100,000 users?",
      "category": "Scalability & Performance",
      "difficulty": "Hard",
      "expectedKeyPoints": [
        "JWT token management",
        "Session storage strategies",
        "Load balancing considerations",
        "Security implications"
      ],
      "context": "Currently no authentication implemented"
    }}
  ]
}}

**Categories to use:**
- "Architecture & Design"
- "Scalability & Performance" 
- "Error Handling & Robustness"
- "Security & Authentication"
- "Code Quality & Best Practices"
- "Trade-offs & Alternatives"

**Difficulty levels:**
- "Easy": Basic understanding (20%)
- "Medium": Practical application (60%)
- "Hard": Deep architectural thinking (20%)

Generate exactly 5 questions following this JSON structure. Return ONLY valid JSON, no markdown formatting.
"""

# --- Helper Functions (Unchanged) ---

def extract_owner_repo(url: str):
    parts = url.strip("/").split("/")
    if len(parts) < 2:
        raise ValueError("Invalid GitHub URL format. Expected '.../owner/repo'")
    return parts[-2], parts[-1]


def fetch_file_content(owner, repo, path):
    api_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    # Add a token if you have one to avoid rate limiting
    headers = {}
    if "GITHUB_TOKEN" in os.environ:
         headers["Authorization"] = f"token {os.getenv('GITHUB_TOKEN')}"
    
    try:
        r = requests.get(api_url, headers=headers, timeout=10)
        
        if r.status_code == 200:
            data = r.json()
            if "content" in data:
                import base64
                decoded = base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
                print(f"✓ Fetched {path}: {len(decoded)} characters")
                return decoded
        else:
            print(f"✗ Failed to fetch {path}: Status {r.status_code}")
    except Exception as e:
        print(f"✗ Error fetching {path}: {str(e)}")
    
    return ""


def fetch_key_files(owner, repo):
    """Fetch 3-5 main source files (like app.py, main.js, etc.)"""
    api_url = f"https://api.github.com/repos/{owner}/{repo}/contents"
    headers = {}
    if "GITHUB_TOKEN" in os.environ:
         headers["Authorization"] = f"token {os.getenv('GITHUB_TOKEN')}"

    r = requests.get(api_url, headers=headers)
    key_files = {}

    if r.status_code == 200:
        files = r.json()
        
        # Prioritize common main files
        priority_files = [
            "main.py", "app.py", "server.js", "index.js", "index.ts", 
            "main.js", "app.js", "main.cpp", "main.java", "main.go"
        ]
        
        for file in files:
            if file["type"] == "file" and file["name"] in priority_files:
                content = fetch_file_content(owner, repo, file["path"])
                if content:
                    key_files[file["name"]] = content
                if len(key_files) >= 3:
                    break
        
        # If no priority files found, grab any source files (up to 5)
        if len(key_files) < 3:
            for file in files:
                if file["type"] == "file" and file["name"].endswith((".py", ".js", ".ts", ".jsx", ".tsx", ".cpp", ".java", ".go", ".rs")):
                    if file["name"] not in key_files:
                        content = fetch_file_content(owner, repo, file["path"])
                        if content:
                            key_files[file["name"]] = content
                        if len(key_files) >= 5:
                            break
    
    return key_files