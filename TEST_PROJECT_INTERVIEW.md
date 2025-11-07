# Quick Test Guide: Project Interview with Follow-ups

## Prerequisites

1. **MongoDB Running**: `mongod` or MongoDB service active
2. **Environment Variables Set**: 
   - `GOOGLE_API_KEY` in both backend and GithubFeature
   - `GROQ_API_KEY` in GithubFeature
3. **All Services Running**:
   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   cd GithubFeature && uvicorn main:app --reload
   
   # Terminal 3
   cd client && npm run dev
   ```

---

## Test 1: Basic Endpoint Test (GithubFeature API)

### Test the new endpoint directly:

```bash
curl -X POST http://localhost:8000/generate-project-interview \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/ROHAN2027/Jadoo-Tona"}'
```

**Expected Response**:
```json
{
  "repo_url": "https://github.com/ROHAN2027/Jadoo-Tona",
  "repo_name": "ROHAN2027/Jadoo-Tona",
  "analyzed_files": ["main.py", "server.js"],
  "questions": [
    {
      "question": "...",
      "category": "Architecture & Design",
      "difficulty": "Medium",
      "expectedKeyPoints": [...],
      "context": "..."
    }
  ]
}
```

---

## Test 2: WebSocket Connection Test

### Using browser console:

```javascript
// Open browser at http://localhost:3000
// Open Developer Console

const ws = new WebSocket('ws://localhost:5000/ws/voice');

ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Received:', JSON.parse(e.data));

// After connection, send:
ws.send(JSON.stringify({
  type: 'start_project_interview',
  repoUrl: 'https://github.com/ROHAN2027/Jadoo-Tona',
  userId: 'test_user'
}));

// Watch console for:
// - ai_question message with first question
// - audio_chunk messages (TTS streaming)
```

---

## Test 3: Full UI Flow Test

### Steps:

1. **Navigate to Voice Interview Page**
   - Go to `http://localhost:3000`
   - Look for "Project Interview" option

2. **Enter Repository URL**
   - Input: `https://github.com/ROHAN2027/Jadoo-Tona`
   - Click "Analyze Repository & Start Interview"

3. **Verify Question Display**
   - ✅ Question appears
   - ✅ Context shows (e.g., "Related to...")
   - ✅ Category and difficulty shown
   - ✅ Audio plays

4. **Answer Question (Voice or Skip)**
   - Click "Start Recording"
   - Speak for 10-15 seconds
   - Click "Stop Recording"
   - Wait for transcription

5. **Verify Evaluation**
   - ✅ Score appears (0-10)
   - ✅ Feedback shown
   - ✅ Current total score updates

6. **Check for Follow-up**
   - If score is 5-8:
     - ✅ Yellow "Follow-up Question" badge appears
     - ✅ New question asked
     - ✅ Total questions count increases
   - If score is 0-4 or 9-10:
     - ✅ Moves to next base question

7. **Complete Interview**
   - Answer all questions
   - ✅ "Interview Complete" message
   - ✅ Final score shown

---

## Test 4: Database Verification

### Check MongoDB for saved data:

```bash
# Connect to MongoDB
mongosh jadutona

# Find the latest interview session
db.interviewsessions.find().sort({startedAt: -1}).limit(1).pretty()
```

**Verify**:
- ✅ `sessionType: "project"`
- ✅ `githubRepo.url` is set
- ✅ `projectQuestions` array has questions
- ✅ Questions have `aiEvaluation` with scores
- ✅ Some questions have `isFollowUp: true`
- ✅ `projectTotalScore` and `projectMaxScore` are calculated

---

## Test 5: Follow-up Generation Test

### Manually test follow-up logic:

```javascript
// In backend/services/geminiEvaluator.js or Node REPL
import { generateFollowUpQuestion } from './backend/services/geminiEvaluator.js';

const question = {
  question: "Why did you choose MongoDB for this project?",
  category: "Architecture & Design",
  difficulty: "Medium"
};

const userAnswer = "I chose MongoDB because it's NoSQL and flexible.";
const score = 7;

const followUp = await generateFollowUpQuestion(question, userAnswer, score);
console.log('Follow-up:', followUp);
```

**Expected**: A relevant follow-up question like:
```
"Can you describe a specific scenario where MongoDB's schema-less design helped you avoid refactoring?"
```

---

## Test 6: Error Handling Tests

### Test invalid repo URL:
```
Input: https://github.com/invalid/nonexistent-repo-xyz123
Expected: Error message "Could not analyze repository..."
```

### Test malformed URL:
```
Input: not-a-valid-url
Expected: "Please enter a valid GitHub repository URL"
```

### Test with GithubFeature down:
```
1. Stop GithubFeature service (Ctrl+C in Terminal 2)
2. Try to start project interview
Expected: "GitHub analysis service is unavailable..."
```

---

## Test 7: Follow-up Depth Limit

### Verify only 1 level of follow-up:

1. Answer question with score 7 → Follow-up asked
2. Answer follow-up with score 7 again
3. **Expected**: Should NOT ask another follow-up
4. **Should**: Move to next base question

Check in code (`voiceHandler.js`):
```javascript
sessionQuestion.followUpDepth === 0  // Only base questions get follow-ups
```

---

## Expected Logs (Backend Console)

```
[WebSocket] New connection: abc123-def456...
[Project Interview] abc123 starting for repo: https://github.com/...
[Project Interview] Generated 5 questions for ROHAN2027/Jadoo-Tona
[Project Interview] abc123 DB session created: 673c...
[TTS] abc123 audio streaming complete (buffered 150 total chunks)
[STT] abc123 transcription: I chose MongoDB because...
[Evaluation] abc123 Score: 7/10
[Follow-up] abc123 Score 7 qualifies for follow-up
[Follow-up] abc123 Generated: Can you describe a scenario...
[Follow-up Insert] abc123 After question 0
[Follow-up Insert] abc123 Total questions now: 6
[TTS] abc123 audio streaming complete (buffered 130 total chunks)
```

---

## Performance Benchmarks

Expected timings:
- **Repo Analysis**: 5-15 seconds (depends on repo size)
- **Question Generation**: 3-8 seconds (Gemini API)
- **Follow-up Generation**: 2-5 seconds (Gemini API)
- **Speech-to-Text**: 1-3 seconds (Groq Whisper)
- **Text-to-Speech**: 2-4 seconds (Groq TTS)
- **Total per question**: ~15-30 seconds

---

## Debugging Tips

### Issue: No follow-up questions appearing
**Check**:
1. Scores are between 5-8 (check logs)
2. `generateFollowUpQuestion()` returns non-null
3. `followUpDepth === 0` in DB

### Issue: Questions not loading
**Check**:
1. GithubFeature API is running (`http://localhost:8000/docs`)
2. GitHub repo is public and valid
3. GOOGLE_API_KEY is set correctly
4. Check Gemini API quota

### Issue: Audio not playing
**Check**:
1. GROQ_API_KEY is valid
2. Browser allows audio playback
3. Check network tab for TTS requests
4. Verify audio chunks in WebSocket messages

### Issue: Transcription fails
**Check**:
1. Microphone permissions granted
2. Audio recording is actually capturing sound
3. WebSocket connection is open
4. Check browser console for errors

---

## Success Indicators ✅

If all working correctly, you should see:

1. ✅ Repo analysis completes in <20 seconds
2. ✅ 5 questions generated with context
3. ✅ Voice recording and transcription work
4. ✅ Scores calculated and saved to DB
5. ✅ Follow-up questions appear for scores 5-8
6. ✅ No follow-up for scores 0-4 or 9-10
7. ✅ UI shows follow-up badge correctly
8. ✅ Interview completes with final score
9. ✅ All data saved in MongoDB

---

## Quick Smoke Test (2 minutes)

```bash
# 1. Start services (3 terminals)
cd backend && npm run dev &
cd GithubFeature && uvicorn main:app --reload &
cd client && npm run dev

# 2. Test API endpoint
curl -X POST http://localhost:8000/generate-project-interview \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/ROHAN2027/Jadoo-Tona"}' | jq

# 3. Open browser: http://localhost:3000
# 4. Start project interview with same URL
# 5. Answer one question
# 6. Verify score and follow-up logic

# If all above work → ✅ Implementation successful!
```

---

## Troubleshooting Commands

```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand({ ping: 1 })"

# Check if ports are available
lsof -i :3000  # Client
lsof -i :5000  # Backend
lsof -i :8000  # GithubFeature

# View backend logs
cd backend && npm run dev | tee backend.log

# Test Gemini API connection
curl https://generativelanguage.googleapis.com/v1/models \
  -H "x-goog-api-key: $GOOGLE_API_KEY"

# Test Groq API connection
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer $GROQ_API_KEY"
```

---

**Happy Testing! 🚀**
