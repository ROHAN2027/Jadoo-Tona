# 📋 Quick Reference Card

## 🚀 Getting Started

```powershell
# Navigate to client folder
cd c:\Users\VICTUS\Desktop\nodejs\jadutona\client

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Open browser
http://localhost:3000
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app with header and problem selector |
| `src/components/CodeEditor.jsx` | Split-screen container |
| `src/components/ProblemDescription.jsx` | Left panel - problem display |
| `src/components/EditorPanel.jsx` | Right panel - editor & output |
| `src/data/problems.js` | Sample DSA problems |
| `src/index.css` | Global styles + Tailwind |

## 🎨 Component Props

### CodeEditor
```jsx
<CodeEditor problem={problemObject} />
```

### ProblemDescription
```jsx
<ProblemDescription problem={problemObject} />
```

### EditorPanel
```jsx
<EditorPanel problemId={string|number} />
```

## 🔧 Common Tasks

### Add a New Problem
Edit `src/data/problems.js`:
```javascript
{
  id: 5,
  title: 'Problem Title',
  difficulty: 'Easy', // 'Easy' | 'Medium' | 'Hard'
  description: '<p>HTML description</p>',
  examples: [{
    input: 'nums = [1,2,3]',
    output: '[1,2,3]',
    explanation: 'Optional'
  }],
  constraints: ['Constraint 1', 'Constraint 2']
}
```

### Add a New Language
1. Add to dropdown in `EditorPanel.jsx`:
```jsx
<option value="go">Go</option>
```

2. Add default code template:
```javascript
const DEFAULT_CODE = {
  // ... existing
  go: `package main\n\nfunc solution() {\n\n}`
};
```

### Connect to Backend API
In `EditorPanel.jsx`, find `handleSubmitCode()`:
```javascript
const response = await fetch('YOUR_API_URL/submit-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code, language, problemId }),
});
const result = await response.json();
```

### Change Editor Theme
In `EditorPanel.jsx`:
```jsx
<Editor
  theme="vs-dark"  // Options: "vs-dark", "light", "hc-black"
  // ...
/>
```

### Customize Colors
Edit Tailwind classes:
- Easy badge: `bg-green-100 text-green-800`
- Medium badge: `bg-yellow-100 text-yellow-800`
- Hard badge: `bg-red-100 text-red-800`

## 🧪 Testing Features

### Test Language Switching
1. Select a language from dropdown
2. Verify default code loads
3. Verify syntax highlighting works

### Test Code Submission
1. Write some code
2. Click "Submit"
3. Watch for loading state (spinner)
4. See result (green success or red error)

### Test Problem Switching
1. Use header dropdown
2. Select different problem
3. Verify description updates
4. Verify code resets

## 🎯 State Variables (EditorPanel)

```javascript
language  // Current programming language
code      // Current code in editor
output    // Submission result object
isLoading // True when submitting code
```

## 📤 API Format

### Request Payload
```javascript
{
  code: string,        // User's code
  language: string,    // Selected language
  problemId: string    // Problem ID
}
```

### Expected Response
```javascript
// Success
{
  status: "Accepted",
  message: "All 10 test cases passed!",
  testsPassed: 10,
  totalTests: 10
}

// Error
{
  status: "Wrong Answer",
  message: "Test case 3 failed",
  testsPassed: 2,
  totalTests: 10,
  failedInput: "...",
  expectedOutput: "...",
  actualOutput: "..."
}
```

## 🎨 Color Scheme

```
Header:        bg-gray-900 text-white
Description:   bg-white text-gray-900
Editor:        Monaco "vs-dark"
Output:        bg-white

Success:       bg-green-50 text-green-700
Error:         bg-red-50 text-red-700
Warning:       bg-yellow-50 text-yellow-700

Easy:          bg-green-100 text-green-800
Medium:        bg-yellow-100 text-yellow-800
Hard:          bg-red-100 text-red-800
```

## 🔍 Debugging

### Common Issues

**Editor not loading?**
- Check console for Monaco errors
- Ensure @monaco-editor/react is installed
- Check internet connection

**Styles not working?**
- Verify Tailwind is installed
- Check PostCSS config
- Look for CSS errors in console

**Code not submitting?**
- Check console for JavaScript errors
- Verify handleSubmitCode function
- Check network tab for failed requests

### Console Commands
```javascript
// In browser console:
localStorage.clear()        // Clear saved data
window.location.reload()    // Hard refresh
```

## 📚 Documentation

- **README.md** - Full project documentation
- **COMPONENT_API.md** - Component reference
- **VISUAL_GUIDE.md** - Visual structure diagrams
- **PROJECT_SUMMARY.md** - Complete feature list

## 🔗 Dependencies

```
react               - UI framework
react-dom           - React DOM rendering
@monaco-editor/react - Code editor
vite                - Build tool
tailwindcss         - CSS framework
autoprefixer        - CSS vendor prefixes
postcss             - CSS processing
```

## 🎯 Port & URLs

- **Development**: http://localhost:3000
- **Port**: 3000 (configurable in vite.config.js)

## ⚡ Hot Module Replacement

Vite provides HMR - your changes appear instantly without full page reload!

## 🏗️ Build for Production

```powershell
npm run build
# Output in: dist/
```

## 📦 Project Structure

```
client/
├── src/              # Source code
│   ├── components/   # React components
│   ├── data/         # Sample data
│   ├── App.jsx       # Root component
│   ├── main.jsx      # Entry point
│   └── index.css     # Styles
├── index.html        # HTML template
├── package.json      # Dependencies
└── *.config.js       # Configuration files
```

## ✅ Checklist for Backend Integration

- [ ] Replace simulated API call with real endpoint
- [ ] Add authentication headers
- [ ] Handle API errors properly
- [ ] Add retry logic
- [ ] Implement rate limiting
- [ ] Add loading timeouts
- [ ] Test with real backend

## 🎓 Learning Path

1. Understand React components
2. Learn React hooks (useState)
3. Study Monaco Editor API
4. Master Tailwind CSS
5. Learn Vite configuration
6. Practice API integration

---

**Quick Help**: If stuck, check the detailed docs:
- README.md - General help
- COMPONENT_API.md - Component details
- VISUAL_GUIDE.md - Architecture diagrams

**Current Status**: ✅ Application running at http://localhost:3000
