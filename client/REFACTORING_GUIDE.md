# App.jsx Refactoring - Clean Architecture

## Overview
The App.jsx has been refactored from **288 lines** to **154 lines** (47% reduction) by extracting functions and UI components into separate, reusable modules.

---

## 📁 New Project Structure

```
client/src/
├── App.jsx                          (Main application - now clean and focused)
├── components/
│   ├── CodeEditor.jsx               (Existing - manages problem selection)
│   ├── EditorPanel.jsx              (Existing - code editor and submission)
│   ├── ProblemDescription.jsx       (Existing - problem display)
│   ├── Header.jsx                   (NEW - Header with timer and progress)
│   └── ScreenViews.jsx              (NEW - All screen components)
└── controllers/
    ├── apiController.js             (NEW - API calls)
    ├── interviewController.js       (NEW - Interview logic)
    └── utilsController.js           (NEW - Utility functions)
```

---

## 📦 New Files Created

### 1. **controllers/apiController.js**
**Purpose**: Handle all API communication with backend

**Exports**:
- `API_BASE_URL` - Base URL for API calls
- `fetchRandomQuestions(count)` - Fetch random questions from backend
  - Gets random question titles and time limits
  - Fetches full details for each question
  - Converts time limits from minutes to seconds
  - Returns array of complete question objects

**Usage**:
```javascript
import { fetchRandomQuestions } from './controllers/apiController';
const questions = await fetchRandomQuestions(2);
```

---

### 2. **controllers/utilsController.js**
**Purpose**: Utility functions for formatting and UI logic

**Exports**:
- `formatTime(seconds)` - Format time as MM:SS
- `getTimerColor(timeRemaining)` - Get CSS class based on time
  - Red: ≤ 60 seconds
  - Yellow: ≤ 300 seconds (5 mins)
  - Green: > 300 seconds
- `getProgressStatus(index, currentIndex, completedProblems, skippedProblems)` - Get progress indicator status
  - Returns: `{ colorClass: string, status: string }`

**Usage**:
```javascript
import { formatTime, getTimerColor } from './controllers/utilsController';
const timeDisplay = formatTime(120); // "02:00"
const colorClass = getTimerColor(45); // "text-red-500"
```

---

### 3. **controllers/interviewController.js**
**Purpose**: Interview state management and navigation logic

**Exports**:
- `handleSkipQuestion()` - Handle skip action
- `handleSubmitQuestion()` - Handle submit action
- `handleAutoSubmitQuestion()` - Handle auto-submit on timer expiry
- `moveToNextQuestion()` - Navigate to next question or complete interview

**Usage**:
```javascript
import { handleSkipQuestion } from './controllers/interviewController';

const handleSkip = (code) => {
  handleSkipQuestion(
    currentProblemIndex, 
    skippedProblems, 
    setSkippedProblems, 
    moveToNext
  );
};
```

---

### 4. **components/Header.jsx**
**Purpose**: Reusable header component with timer and progress

**Props**:
- `currentProblemIndex` - Current question index
- `totalQuestions` - Total number of questions
- `timeRemaining` - Time remaining in seconds
- `completedProblems` - Array of completed indices
- `skippedProblems` - Array of skipped indices

**Features**:
- Displays app branding
- Shows current question number
- Timer with color coding
- Progress dots (green=completed, yellow=skipped, blue=current, gray=pending)

**Usage**:
```javascript
<Header
  currentProblemIndex={0}
  totalQuestions={2}
  timeRemaining={600}
  completedProblems={[]}
  skippedProblems={[]}
/>
```

---

### 5. **components/ScreenViews.jsx**
**Purpose**: All full-screen views (loading, error, complete, no questions)

**Exports**:
- `<LoadingScreen />` - Animated loading spinner
- `<ErrorScreen error={string} />` - Error display with retry button
- `<InterviewCompleteScreen {...props} />` - Success screen with stats
- `<NoQuestionsScreen />` - Empty state screen

**Usage**:
```javascript
import { LoadingScreen, ErrorScreen } from './components/ScreenViews';

if (isLoading) return <LoadingScreen />;
if (error) return <ErrorScreen error={error} />;
```

---

## ✨ Benefits of Refactoring

### 1. **Cleaner Code**
- App.jsx reduced from 288 to 154 lines (47% smaller)
- Single Responsibility Principle applied
- Easy to read and understand

### 2. **Better Maintainability**
- Each file has a specific purpose
- Changes to API logic don't affect UI components
- Easy to locate and fix bugs

### 3. **Reusability**
- Controllers can be used in other pages
- Screen components can be reused for different flows
- Header can be customized for different sections

### 4. **Testability**
- Each controller function can be tested independently
- UI components can be tested in isolation
- Mock API calls easily in tests

### 5. **Scalability**
- Easy to add new pages (just import controllers)
- Add new API endpoints in apiController
- Create new screen views without cluttering App.jsx

---

## 🔄 What Changed in App.jsx

### Before:
```javascript
// 288 lines with:
- Inline API fetch logic (40+ lines)
- Inline utility functions (formatTime, getTimerColor)
- Inline interview logic handlers
- Inline screen components (loading, error, complete)
- Full header JSX (60+ lines)
```

### After:
```javascript
// 154 lines with:
- Clean imports from controllers
- Minimal state management
- Handler wrappers calling controller functions
- Single-line screen component renders
- Single <Header /> component
```

---

## 🎯 How to Add New Pages

### Example: Adding a Dashboard Page

1. **Create the page component**:
```javascript
// pages/Dashboard.jsx
import React from 'react';
import Header from './components/Header';
import { fetchUserStats } from './controllers/apiController';

function Dashboard() {
  // Your page logic
  return (
    <div>
      <Header {...props} />
      {/* Dashboard content */}
    </div>
  );
}
```

2. **Add new API functions**:
```javascript
// controllers/apiController.js
export const fetchUserStats = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/stats`);
  return response.json();
};
```

3. **Reuse existing components**:
```javascript
import { LoadingScreen, ErrorScreen } from './components/ScreenViews';
```

---

## ✅ Testing Checklist

- [x] Frontend runs successfully on port 3000
- [x] No ESLint/TypeScript errors
- [x] App.jsx imports all controllers correctly
- [x] Header component displays properly
- [x] Screen views render correctly
- [x] API calls work as before
- [x] Timer and progress functionality intact
- [x] Question navigation works
- [x] All paths are correct

---

## 📝 File Paths Summary

| File | Path | Lines | Purpose |
|------|------|-------|---------|
| App.jsx | `client/src/App.jsx` | 154 | Main app logic |
| apiController | `client/src/controllers/apiController.js` | 45 | API calls |
| utilsController | `client/src/controllers/utilsController.js` | 55 | Utilities |
| interviewController | `client/src/controllers/interviewController.js` | 70 | Interview logic |
| Header | `client/src/components/Header.jsx` | 65 | Header UI |
| ScreenViews | `client/src/components/ScreenViews.jsx` | 85 | Screen components |

---

## 🚀 Next Steps

1. **Add more pages**: Use the same pattern for Dashboard, Profile, Results pages
2. **Extend API controller**: Add endpoints for user management, submissions, etc.
3. **Add authentication**: Create `authController.js` for login/logout logic
4. **Create routing**: Use React Router with clean page components
5. **Add state management**: Consider Redux/Zustand if app grows larger

---

## 💡 Key Takeaways

✅ **Separation of Concerns**: API, Logic, and UI are separated  
✅ **DRY Principle**: No code duplication  
✅ **Single Responsibility**: Each file does one thing well  
✅ **Easy to Scale**: Add pages without touching existing code  
✅ **Maintainable**: Bug fixes are isolated to specific files  

---

**Status**: ✅ All refactoring complete and tested successfully!
