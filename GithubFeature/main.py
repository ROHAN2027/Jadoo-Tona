from dotenv import load_dotenv

# Load environment variables FIRST, before any other imports
load_dotenv()

from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import requests
import os
import google.generativeai as genai  # <-- Import Gemini
from bs4 import BeautifulSoup

# Import voice service router (after load_dotenv)
from voice_service import router as voice_router

# Resume parsing helper
from src.services import extract_resume_info


app = FastAPI(title="Jadoo-Tona AI Services API")

# Include voice service routes
app.include_router(voice_router)


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
    
    r = requests.get(api_url, headers=headers)
    
    if r.status_code == 200:
        data = r.json()
        if "content" in data:
            import base64
            return base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
    return ""


def fetch_key_files(owner, repo):
    """Fetch 1–2 main source files (like app.py, main.js, etc.)"""
    api_url = f"https://api.github.com/repos/{owner}/{repo}/contents"
    headers = {}
    if "GITHUB_TOKEN" in os.environ:
         headers["Authorization"] = f"token {os.getenv('GITHUB_TOKEN')}"

    r = requests.get(api_url, headers=headers)
    key_files = {}

    if r.status_code == 200:
        files = r.json()
        
        # Prioritize common main files
        priority_files = ["main.py", "app.py", "index.js", "index.ts", "server.js", "main.cpp", "main.java"]
        
        for file in files:
            if file["name"] in priority_files:
                key_files[file["name"]] = fetch_file_content(owner, repo, file["path"])
                if len(key_files) >= 2: break
        
        # If no priority files found, grab any 2 source files
        if len(key_files) < 2:
            for file in files:
                if file["type"] == "file" and file["name"].endswith((".py", ".js", ".ts", ".cpp", ".java", ".go")):
                    if file["name"] not in key_files:
                        key_files[file["name"]] = fetch_file_content(owner, repo, file["path"])
                        if len(key_files) >= 2:
                            break
    return key_files