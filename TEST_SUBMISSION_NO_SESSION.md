# Test Submission Tracking

## Without sessionId (uses default)

```powershell
# Test 1: Submit without sessionId
curl -X POST "http://localhost:5000/api/problems/submit/Two%20Sum" `
  -H "Content-Type: application/json" `
  -d '{\"code\": \"def twoSum(nums, target):\\n    return [0, 1]\", \"language\": \"python\"}'

# Test 2: Save snapshot without sessionId
curl -X POST "http://localhost:5000/api/problems/snapshot/Two%20Sum" `
  -H "Content-Type: application/json" `
  -d '{\"code\": \"def twoSum(nums, target):\\n    # TODO\", \"language\": \"python\"}'
```

## Check Database

```powershell
mongosh jadutona --eval "db.submissions.find().pretty()"
```

## With sessionId (optional, for future use)

```powershell
curl -X POST "http://localhost:5000/api/problems/submit/Two%20Sum" `
  -H "Content-Type: application/json" `
  -d '{\"code\": \"def twoSum(nums, target):\\n    return [0, 1]\", \"language\": \"python\", \"sessionId\": \"interview-123\"}'
```

## How it works NOW

### Without sessionId in request:
- All submissions go to `sessionId: "default-session"`
- Still maintains one entry per problem
- Works with existing frontend (no changes needed)

### With sessionId in request:
- Each session gets separate submissions
- Future-proof for when you add session management

## Frontend - No Changes Needed!

Your existing frontend will work as-is:

```javascript
// Current code (no sessionId)
await fetch(`/api/problems/submit/${title}`, {
  method: 'POST',
  body: JSON.stringify({ code, language })
});

// ✅ This works! Uses "default-session" automatically
```

## When you're ready for sessions:

```javascript
// Future code (with sessionId)
await fetch(`/api/problems/submit/${title}`, {
  method: 'POST',
  body: JSON.stringify({ code, language, sessionId: currentSession })
});
```

## Database Structure

```javascript
// Without sessionId passed
{
  sessionId: "default-session",  // Auto-assigned
  problemTitle: "Two Sum",
  code: "...",
  language: "python",
  result: "Accepted",
  testCasesPassed: 5,
  totalTestCases: 5
}

// With sessionId passed
{
  sessionId: "interview-123",    // Custom session
  problemTitle: "Two Sum",
  code: "...",
  language: "python",
  result: "Accepted",
  testCasesPassed: 5,
  totalTestCases: 5
}
```
