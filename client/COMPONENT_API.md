# Component API Reference

## CodeEditor Component

Main component that combines the problem description and editor panels.

### Props

```javascript
<CodeEditor problem={problemObject} />
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `problem` | Object | Yes | Problem data object containing all problem details |

### Problem Object Structure

```javascript
{
  id: Number,              // Unique problem identifier
  title: String,           // Problem title
  difficulty: String,      // "Easy", "Medium", or "Hard"
  description: String,     // HTML formatted problem description
  examples: Array,         // Array of example objects
  constraints: Array       // Array of constraint strings
}
```

---

## ProblemDescription Component

Displays the problem details in the left panel.

### Props

```javascript
<ProblemDescription problem={problemObject} />
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `problem` | Object | Yes | Same structure as CodeEditor's problem prop |

### Features

- Color-coded difficulty badges (Green/Yellow/Red)
- HTML rendering for formatted descriptions
- Example blocks with input/output/explanation
- Constraints list

---

## EditorPanel Component

Interactive code editor with language selection and output display.

### Props

```javascript
<EditorPanel problemId={string|number} />
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `problemId` | String/Number | Yes | ID to send with code submission |

### State Variables

```javascript
const [language, setLanguage] = useState('python');
const [code, setCode] = useState(DEFAULT_CODE['python']);
const [output, setOutput] = useState(null);
const [isLoading, setIsLoading] = useState(false);
```

### Default Code Templates

Default code templates are provided for:
- Python
- JavaScript
- Java
- C++

Modify the `DEFAULT_CODE` object to customize templates.

### Event Handlers

#### `onLanguageChange(event)`
Triggered when user changes the programming language.
- Updates language state
- Loads default code for new language
- Clears output

#### `handleEditorChange(value)`
Triggered when user types in the editor.
- Updates code state with new value

#### `handleSubmitCode()`
Async function triggered by Submit button.
- Sets loading state
- Constructs payload: `{ code, language, problemId }`
- Makes API call (currently simulated)
- Updates output with results

### Output States

The output panel can display:

1. **Initial State**: Placeholder message
2. **Loading State**: Spinner with "Running test cases..." message
3. **Success State**: Green "Accepted" message with test results
4. **Error State**: Red "Wrong Answer" or "Error" message with details

### Monaco Editor Options

```javascript
{
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  automaticLayout: true,
}
```

Customize in `EditorPanel.jsx` to adjust editor behavior.

---

## Styling Guide

### Tailwind Classes Used

#### Difficulty Badges
- Easy: `bg-green-100 text-green-800 border-green-300`
- Medium: `bg-yellow-100 text-yellow-800 border-yellow-300`
- Hard: `bg-red-100 text-red-800 border-red-300`

#### Output Status
- Success: `bg-green-50 border-green-200 text-green-700`
- Error: `bg-red-50 border-red-200 text-red-700`
- Loading: Spinner with `animate-spin`

### Custom CSS

Global styles are in `src/index.css` with Tailwind directives.

---

## API Integration Details

### Request Payload

```javascript
{
  code: String,        // User's code
  language: String,    // Selected language
  problemId: String    // Problem identifier
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

// Failure
{
  status: "Wrong Answer",
  message: "Test case 3 failed",
  testsPassed: 2,
  totalTests: 10,
  failedInput: "[3,2,4], target = 6",
  expectedOutput: "[1,2]",
  actualOutput: "[0,1]"
}

// Error
{
  status: "Error",
  message: "Runtime error: Division by zero"
}
```

### API Endpoint Location

File: `src/components/EditorPanel.jsx`  
Function: `handleSubmitCode()`  
Line: Look for `[API CALL PLACEHOLDER]` comment

---

## Extending the Application

### Adding New Languages

1. **Add to language selector** (`EditorPanel.jsx`):
```javascript
<option value="go">Go</option>
```

2. **Add default code template**:
```javascript
const DEFAULT_CODE = {
  // ... existing languages
  go: `package main

import "fmt"

func solution(nums []int, target int) []int {
    // Write your code here
    return []int{}
}

func main() {
    result := solution([]int{2,7,11,15}, 9)
    fmt.Println(result)
}`
};
```

3. **Update Monaco Editor language** (if needed):
```javascript
<Editor
  language={language === 'go' ? 'go' : language}
  // ... other props
/>
```

### Customizing Editor Behavior

Modify the `options` prop in `EditorPanel.jsx`:

```javascript
<Editor
  options={{
    minimap: { enabled: true },        // Show minimap
    fontSize: 16,                       // Increase font size
    lineNumbers: 'on',                  // Line numbers
    rulers: [80, 120],                  // Column rulers
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on',                     // Enable word wrap
    theme: 'vs-dark',
  }}
/>
```

### Adding Code Snippets

Use Monaco's snippet API to add custom snippets for each language.

### Implementing Code Persistence

Use localStorage to save user's code:

```javascript
// Save code
useEffect(() => {
  localStorage.setItem(`code-${problemId}-${language}`, code);
}, [code, problemId, language]);

// Load code
useEffect(() => {
  const saved = localStorage.getItem(`code-${problemId}-${language}`);
  if (saved) setCode(saved);
}, [problemId, language]);
```

---

## Performance Considerations

1. **Monaco Editor**: Loaded asynchronously, may take time on first load
2. **Large Code**: Editor handles large files well, but consider debouncing saves
3. **Problem Switching**: Code is reset when switching problems (by design)
4. **API Calls**: Currently simulated with 2-second delay; adjust for real API

---

## Troubleshooting

### Editor Not Loading
- Check browser console for errors
- Ensure @monaco-editor/react is installed
- Verify internet connection (Monaco downloads workers)

### Styles Not Applied
- Run `npm install` to ensure Tailwind is installed
- Check that `index.css` imports Tailwind directives
- Verify PostCSS configuration

### Language Not Switching
- Check console for errors in `onLanguageChange`
- Verify language name matches Monaco's language ID
- Ensure DEFAULT_CODE has entry for the language

### API Not Working
- Check network tab for failed requests
- Verify API endpoint URL is correct
- Check CORS settings on backend
- Verify request/response format matches expected structure

---

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (may need polyfills for older versions)
- **Mobile**: Limited support (Monaco editor works but not optimized)

---

For more information, see the main [README.md](./README.md) file.
