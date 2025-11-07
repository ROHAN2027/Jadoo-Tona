# Submission Tracking System

## Overview
The submission system now tracks code submissions for each problem in an interview session. It maintains **ONE submission per problem** with intelligent update logic.

## Database Schema

### Submission Model
```javascript
{
  sessionId: ObjectId,          // Links to InterviewSession
  problemTitle: String,          // Problem identifier
  problemId: ObjectId,           // Reference to Problem
  code: String,                  // User's code
  language: String,              // python|javascript|java|cpp
  result: String,                // Accepted|Wrong Answer|Runtime Error|etc.
  testCasesPassed: Number,       // How many test cases passed
  totalTestCases: Number,        // Total test cases
  executionTime: Number,         // Total execution time in ms
  memoryUsed: Number,            // Peak memory in KB
  submittedAt: Date,             // Last submission time
  timestamps: true               // createdAt, updatedAt
}
```

### Unique Constraint
- **One submission per (sessionId, problemTitle)** - enforced by compound unique index

## Update Logic

### 1. `saveOrUpdateBest()` - Used by Submit Endpoint
Keeps the **best performing submission**:

```javascript
// Priority order:
1. Higher testCasesPassed → Update
2. Same testCasesPassed but new is "Accepted" → Update
3. Otherwise → Keep existing result, but update code & timestamp
```

**Example:**
- Submission 1: 3/5 test cases passed → Saved
- Submission 2: 2/5 test cases passed → Code updated, but keeps first result (3/5)
- Submission 3: 5/5 test cases passed (Accepted) → Fully updated

### 2. `saveLastSubmission()` - Used by Snapshot Endpoint
Always **overwrites with latest code**:
- Used when user skips a question
- Used when timer runs out
- Used to save work-in-progress

## API Endpoints

### 1. Submit Code (with execution)
```http
POST /api/problems/submit/:title
Content-Type: application/json

{
  "code": "def twoSum(nums, target):\n    ...",
  "language": "python",
  "sessionId": "673c5f8a9b2e4c1a3d5e6f7a"
}
```

**Response:**
```json
{
  "status": "Accepted",
  "totalTestCases": 8,
  "testCasesPassed": 8
}
```

**Side Effect:** Automatically saves submission using `saveOrUpdateBest()`

### 2. Save Code Snapshot (without execution)
```http
POST /api/problems/snapshot/:title
Content-Type: application/json

{
  "code": "def twoSum(nums, target):\n    # Work in progress...",
  "language": "python",
  "sessionId": "673c5f8a9b2e4c1a3d5e6f7a"
}
```

**Response:**
```json
{
  "message": "Code snapshot saved successfully",
  "problemTitle": "Two Sum"
}
```

## Frontend Integration

### When to Call Snapshot Endpoint

```javascript
// 1. When user skips a question
const handleSkip = async () => {
  await fetch(`/api/problems/snapshot/${problem.title}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: editorCode,
      language: selectedLanguage,
      sessionId: currentSessionId
    })
  });
  // Move to next question
};

// 2. When timer expires
useEffect(() => {
  if (timeLeft === 0) {
    saveSnapshot(); // Save before auto-advancing
    handleAutoSubmit();
  }
}, [timeLeft]);

// 3. Periodic autosave (optional)
useEffect(() => {
  const autosaveInterval = setInterval(() => {
    saveSnapshot();
  }, 60000); // Every 60 seconds
  
  return () => clearInterval(autosaveInterval);
}, [editorCode, selectedLanguage]);
```

### Getting sessionId

You need to pass `sessionId` with every submission. Update your interview session creation:

```javascript
// In DSAInterviewPage.jsx - on component mount
useEffect(() => {
  const initSession = async () => {
    const response = await fetch('/api/interview-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'dsa',
        startTime: new Date()
      })
    });
    const data = await response.json();
    setSessionId(data.sessionId);
  };
  initSession();
}, []);
```

## MongoDB Queries

### View all submissions
```javascript
db.submissions.find().pretty()
```

### View submissions for a specific session
```javascript
db.submissions.find({ sessionId: ObjectId("673c5f8a9b2e4c1a3d5e6f7a") }).pretty()
```

### View accepted submissions only
```javascript
db.submissions.find({ result: "Accepted" }).pretty()
```

### Get submission for a specific problem in a session
```javascript
db.submissions.findOne({ 
  sessionId: ObjectId("673c5f8a9b2e4c1a3d5e6f7a"),
  problemTitle: "Two Sum"
})
```

### Count problems solved per session
```javascript
db.submissions.aggregate([
  { $match: { result: "Accepted" } },
  { $group: { _id: "$sessionId", problemsSolved: { $sum: 1 } } }
])
```

## Usage in Report Generation

When generating the final interview report:

```javascript
// Get all submissions for the session
const submissions = await Submission.find({ sessionId })
  .populate('problemId', 'difficulty')
  .sort({ submittedAt: 1 });

const report = {
  totalProblems: submissions.length,
  accepted: submissions.filter(s => s.result === 'Accepted').length,
  avgExecutionTime: submissions.reduce((sum, s) => sum + s.executionTime, 0) / submissions.length,
  codeSnapshots: submissions.map(s => ({
    problem: s.problemTitle,
    code: s.code,
    result: s.result
  }))
};
```

## Testing

### 1. Test Submit with SessionId
```bash
curl -X POST http://localhost:5000/api/problems/submit/Two%20Sum \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def twoSum(nums, target):\n    return [0, 1]",
    "language": "python",
    "sessionId": "673c5f8a9b2e4c1a3d5e6f7a"
  }'
```

### 2. Test Snapshot
```bash
curl -X POST http://localhost:5000/api/problems/snapshot/Two%20Sum \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def twoSum(nums, target):\n    # TODO",
    "language": "python",
    "sessionId": "673c5f8a9b2e4c1a3d5e6f7a"
  }'
```

### 3. Check Database
```bash
mongosh jadutona --eval "db.submissions.find().pretty()"
```

## Benefits

✅ **Single Source of Truth** - One submission per problem per session
✅ **Best Performance Tracked** - Always keeps highest score
✅ **Code Preservation** - Never lose work, even on skip/timeout
✅ **Rich Metrics** - Execution time, memory, pass rate
✅ **Report Ready** - All data structured for PDF generation
✅ **Session Linked** - Easy to fetch all work from one interview

## Next Steps

1. Update frontend to include `sessionId` in all API calls
2. Add periodic autosave to prevent data loss
3. Use submission data in InterviewResults page
4. Generate PDF reports from submission data
