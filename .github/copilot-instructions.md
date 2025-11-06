# Jadoo-Tona AI Interview Platform - AI Agent Instructions

## Project Vision

Jadoo-Tona is a comprehensive AI-powered technical interview platform designed to simulate real-world technical interviews across multiple dimensions:

1. **DSA/LeetCode Challenges** ✅ **(Fully Implemented)**
   - Monaco-based code editor supporting Python, JavaScript, Java, C++
   - Real-time code execution via Judge0 API
   - Timer-based interview sessions with auto-submission

2. **Voice Interview System (Conceptual Q&A)** ✅ **(Infrastructure Complete)**
   - Real-time voice interviews with Groq TTS/STT
   - WebSocket-based bidirectional communication
   - Smooth audio streaming with buffering strategy
   - Ready for Gemini AI integration (currently using placeholders)

3. **Project-Specific Deep Dive** 🚧 **(Foundation Ready)**
   - AI analyzes candidate's GitHub repositories
   - Generates contextual questions about their projects
   - Will leverage existing voice interview infrastructure
   - Probes architectural decisions, trade-offs, and design patterns

4. **Performance Report Generation** 🚧 **(Planned)**
   - Automated PDF report generation at interview completion
   - Comprehensive feedback on candidate performance across all modules
   - Includes scores, time metrics, strengths, weaknesses, and recommendations

## Current Implementation Status

### Three Main Services (Microservice Architecture)
- **Backend (Node.js/Express, Port 5000)**: Manages problems, orchestrates code execution via Judge0 API, hosts WebSocket server for voice interviews
- **Client (React/Vite, Port 3000)**: Monaco-based code editor with DSA interview flow, Voice interview UI with audio recording/playback
- **GithubFeature (FastAPI, Port 8000)**: Voice Service (Groq TTS/STT endpoints), GitHub analysis with Gemini AI question generation

## Architecture & Design Decisions

### Backend: Problem-Centric Design with Driver Code Pattern
The system uses a **driver code injection pattern** where user code is wrapped with problem-specific test harnesses. This is critical:

- **Problem Model** (`backend/models/problems.model.js`): Stores `boilerplate_code` (shown to users) and `driver_code` (hidden test harness) as Maps keyed by language (`python`, `javascript`, `java`, `cpp`)
- **Driver Code Pattern**: User code is inserted at placeholder `// [USER_CODE_WILL_BE_INSERTED_HERE]` in driver templates
- **Test Cases**: `testcase` (visible, for "Run") vs `hidden_testcases` (for "Submit"). Both use JSON stdin format
- **Judge0 Integration**: Batch submissions via `submissionController.js` with base64 encoding and polling for results

**Key Insight**: When adding new problems, ALWAYS provide both `boilerplate_code` AND `driver_code` for all 4 languages. Driver code must parse JSON stdin and call user functions correctly.

### Client: Interview Flow State Machine
The React app (`client/src/App.jsx`) manages interview sessions:

1. **Initialization**: Fetch N random questions from `/api/problems/random/questions?count=N` (weighted: 50% Hard, 25% Medium, 25% Easy)
2. **Per-Question Timer**: Each problem has `timeLimit` in seconds, auto-submits on timeout
3. **Progress Tracking**: `completedProblems` and `skippedProblems` arrays track indices
4. **Submission Flow**: "Submit" sends to `/submit/:title` → on "Accepted" → auto-advances after 3s

**Critical**: The split-screen `CodeEditor.jsx` uses percentage-based resizing. The `EditorPanel.jsx` fetches boilerplate from `problem.boilerplate_code[language]` on mount and language change.

### Judge0 API Workflow (backend/controllers/submissionController.js)
```
1. Build driver script: buildDriverScript(userCode, driverTemplate, language)
2. Create batch submissions: POST /submissions/batch with base64-encoded code + stdin
3. Poll results: GET /submissions/batch?tokens=... until all status.id !== 1|2
4. Compare outputs: Custom JSON comparison in compareOutputs() for "Submit" path
```

**Important**: Judge0 language IDs are hardcoded in `languageMap` (python:71, javascript:93, java:62, cpp:54). Status ID 3 = Accepted.

## Essential Development Workflows

### Running the Full Stack
```bash
# Backend (port 5000)
cd backend
npm run dev  # Uses nodemon

# Client (port 3000 via Vite)
cd client
npm run dev

# GithubFeature API (port 8000)
cd GithubFeature
uvicorn main:app --reload
```

**Environment Variables Required**:
- Backend: `MONGO_URL` (MongoDB connection), `JUDGE0_API_KEY` (RapidAPI key), `PORT` (default: 5000)
- GithubFeature: `GOOGLE_API_KEY` (Gemini), `GITHUB_TOKEN` (optional, avoids rate limits)

### Adding a New Problem
Use `backend/seed_script.js` as template. Must include:
```javascript
{
  title: "Unique Title",
  difficulty: "Easy|Medium|Hard",
  boilerplate_code: { python: "...", javascript: "...", java: "...", cpp: "..." },
  driver_code: { /* Same 4 languages with stdin parsing */ },
  testcase: [{ input: '{"param": value}', expected_output: 'result' }],
  hidden_testcases: [/* More test cases */]
}
```

**Critical Pattern**: Driver code for Java uses Gson (`com.google.gson`). C++ uses manual JSON parsing (see `seed_script.js` for string parsing utilities).

### Testing Submissions Locally
```bash
# Backend test file exists but needs update
node backend/test/testSubmit.js
```

The file `backend/test_run.json` contains sample payloads for manual testing.

## Project-Specific Conventions

### File Naming
- Backend: `lowercase.model.js`, `camelCaseController.js`, `snake_case_route.js`
- Client: `PascalCaseComponent.jsx` (components), `camelCase.js` (data/utils)

### API Routes Pattern (`backend/routes/problem_route.js`)
- `GET /api/problems/random/questions?count=N` - Weighted random selection
- `GET /api/problems/:title` - Fetch single problem (NO testcases sent to client)
- `POST /api/problems/run/:title` - Visible testcases, detailed output
- `POST /api/problems/submit/:title` - All testcases, pass/fail summary only
- `POST /api/problems` - Create new problem (for seeding)

### State Management Pattern (Client)
No Redux/Context - props drilling from `App.jsx`:
```
App.jsx (interview state, timer)
  └─> CodeEditor.jsx (split-screen layout)
       └─> ProblemDescription.jsx (left panel)
       └─> EditorPanel.jsx (code editor, output, submission buttons)
```

**Callback Pattern**: `onSubmit(code, result)` and `onSkip(code)` bubble up to App.jsx to manage question navigation.

## Common Gotchas & Anti-Patterns

### ❌ Don't modify driver code placeholder format
The exact string `// [USER_CODE_WILL_BE_INSERTED_HERE]` or `# [USER_CODE_WILL_BE_INSERTED_HERE]` is critical. Language-specific in `buildDriverScript()`.

### ❌ Don't expose testcases in GET /problems/:title
`backend/controllers/problemController.js` explicitly `.select()` excludes testcase fields to prevent cheating.

### ⚠️ Judge0 Result Polling
The 10-attempt polling loop (`submissionController.js:107`) with 1s delays may timeout on slow Judge0. Increase `maxAttempts` if needed.

### ⚠️ C++ JSON Parsing
Custom `parseIntArray()` and `parseTarget()` in driver code are brittle. Consider adding a JSON library (RapidJSON) for production.

## Integration Points

### Judge0 CE API (RapidAPI)
- Base URL: `https://judge0-ce.p.rapidapi.com`
- Batch endpoint: `/submissions/batch`
- Uses `base64_encoded: true` for all payloads
- Response schema: `{ submissions: [{ token, status: { id, description }, stdout, stderr }] }`

### MongoDB Schema
- Database: `jadutona` (local: `mongodb://localhost:27017/jadutona`)
- Collection: `problems` (Mongoose model in `backend/models/problems.model.js`)
- Indexes: `title` field is unique

### Gemini AI (GithubFeature)
- Model: `gemini-2.5-flash` (see `GithubFeature/main.py:41`)
- Generates 5 technical interview questions from repo context
- Prompt engineering: `/generate-questions` endpoint uses detailed few-shot prompting
- **Future Use**: This forms the foundation for the project-specific interview module

## Future Architecture Considerations

### Voice/Text Interaction System (Shared Infrastructure)
- **Technology Stack**: WebSockets for real-time bidirectional communication
- **Voice Recognition**: Web Speech API or cloud services (Google Speech-to-Text, Azure Speech)
- **Text-to-Speech**: Browser native or cloud TTS services for AI responses
- **Used By**: Both Conceptual Questions and Project Interview modules
- **Architecture**: Reusable conversational interface component

### Conceptual Questions Module (Planned)
- **Technology Stack**: Leverages shared Voice/Text system + WebSockets
- **AI Integration**: Gemini or similar LLM for question generation and response evaluation
- **Question Bank**: Database of CS fundamentals (OS, Networks, DBMS, System Design)
- **Evaluation Logic**: NLP-based scoring for open-ended answers
- **Interaction Mode**: Voice or text-based Q&A with follow-up questions

### Project Interview Module (Planned)
- **Existing Foundation**: `GithubFeature/main.py` already scrapes GitHub repos and generates questions
- **Technology Stack**: Leverages shared Voice/Text system + WebSockets
- **Integration Path**: Extend to include:
  - Repository code analysis for deeper insights
  - Follow-up question generation based on candidate answers
  - Code quality assessment using static analysis tools
- **UI Extension**: Add interview panel component to client for conversational flow
- **Interaction Mode**: Voice or text-based conversational deep dive

### Authentication & Session Management (Required for Full Platform)
- User accounts with interview history
- Session persistence across different interview types
- Progress tracking and analytics dashboard

### PDF Report Generation (Planned)
- **Technology Stack**: Node.js libraries (e.g., `pdfkit`, `puppeteer`, or `jsPDF`) for backend PDF generation
- **Report Components**:
  - **Overall Score**: Aggregate performance across DSA, Conceptual, and Project modules
  - **Module Breakdown**: Detailed metrics for each interview type
    - DSA: Problems solved, time taken, code quality, test case pass rate
    - Conceptual: Response accuracy, depth of understanding, communication clarity
    - Project: Technical depth, problem-solving approach, architecture knowledge
  - **Time Analytics**: Per-question timing, total interview duration
  - **Strengths & Weaknesses**: AI-generated insights using Gemini based on performance data
  - **Recommendations**: Personalized learning paths and areas for improvement
- **Generation Trigger**: Automatically created when interview session completes
- **Storage**: PDFs stored in cloud storage (S3/GCS) or local file system, linked to user session
- **API Endpoint**: `POST /api/interviews/:sessionId/generate-report` → returns PDF URL
- **Frontend Integration**: Download button on interview completion screen

## Testing Strategy

### Backend
- Manual testing via `test_run.json` payloads
- Run individual submissions against Judge0:
  ```bash
  curl -X POST http://localhost:5000/api/problems/submit/Two%20Sum \
    -H "Content-Type: application/json" \
    -d '{"code": "def twoSum(nums, target):\n    return [0, 1]", "language": "python"}'
  ```

### Client
- Monaco Editor loads via CDN (no explicit tests)
- Verify boilerplate switching on language change
- Check timer countdown and auto-submit at 0:00

## Performance Considerations

- **Judge0 Batch Limit**: RapidAPI free tier limits concurrent requests
- **MongoDB Connection**: Single connection pool via `backend/utils/db.js`
- **Client Bundle**: Vite tree-shakes Monaco Editor (~3MB gzipped)
- **Gemini Context**: Truncates repo content to 500k characters to stay under token limits

## Quick Reference: File Responsibilities

| File | Purpose |
|------|---------|
| `backend/server.js` | Express app, CORS, routes registration |
| `backend/controllers/submissionController.js` | Judge0 integration, batch processing, output comparison |
| `backend/controllers/problemController.js` | CRUD for problems, random question selection |
| `backend/models/problems.model.js` | Mongoose schema with Maps for language-specific code |
| `client/src/App.jsx` | Interview flow orchestration, timer, question navigation |
| `client/src/components/EditorPanel.jsx` | Monaco editor, language selector, Run/Submit buttons |
| `GithubFeature/main.py` | FastAPI endpoint, GitHub API scraping, Gemini question generation |

## Security Notes

- No authentication implemented (TODO for production - **critical for multi-module platform**)
- Judge0 API key exposed in backend (use secrets manager in prod)
- CORS set to `cors()` - wide open, restrict in production
- No rate limiting on API endpoints
- **Future Consideration**: Secure WebSocket connections for real-time AI interviews

## Development Roadmap Context

When extending this codebase, keep in mind:

1. **Current Focus**: DSA coding interviews are fully functional
2. **Next Milestone**: Conceptual Q&A module with AI-driven conversations
3. **Final Module**: Project-specific interviews leveraging existing GithubFeature
4. **Reporting Layer**: PDF generation with comprehensive feedback and AI insights
5. **Cross-Cutting Concerns**: Authentication, session management, unified interview dashboard, and data persistence

**Design Philosophy**: Each interview type (DSA, Conceptual, Project) should be modular and independently testable, but share common infrastructure for user management, result tracking, and report generation. Performance data from all modules should be aggregated for comprehensive feedback.

---

**Last Updated**: This file reflects the codebase as of the current state. Update when adding major features like authentication, websockets, or multi-user support.
