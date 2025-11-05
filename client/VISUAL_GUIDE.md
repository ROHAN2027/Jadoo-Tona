# Visual Structure Guide

## Application Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER (App.jsx)                                                   │
│  ┌──────────┐ ┌──────────────────────┐  ┌──────────────────────┐  │
│  │ Jadutona │ │ AI Interview Editor  │  │ Problem: [Dropdown]  │  │
│  └──────────┘ └──────────────────────┘  └──────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────┬────────────────────────────────┐   │
│  │                           │                                │   │
│  │  PROBLEM DESCRIPTION      │    EDITOR PANEL                │   │
│  │  (ProblemDescription.jsx) │    (EditorPanel.jsx)           │   │
│  │                           │                                │   │
│  │  ┌─────────────────────┐  │  ┌──────────────────────────┐  │   │
│  │  │ Title & Difficulty  │  │  │ Language Selector        │  │   │
│  │  │ - 1. Two Sum        │  │  │ [Python ▼]               │  │   │
│  │  │ - [Easy]            │  │  └──────────────────────────┘  │   │
│  │  └─────────────────────┘  │                                │   │
│  │                           │  ┌──────────────────────────┐  │   │
│  │  ┌─────────────────────┐  │  │                          │  │   │
│  │  │ Description         │  │  │  Monaco Editor           │  │   │
│  │  │ - Problem text      │  │  │  - Code here             │  │   │
│  │  │ - HTML formatted    │  │  │  - Syntax highlighting   │  │   │
│  │  └─────────────────────┘  │  │  - Auto-complete         │  │   │
│  │                           │  │                          │  │   │
│  │  ┌─────────────────────┐  │  └──────────────────────────┘  │   │
│  │  │ Example 1:          │  │                                │   │
│  │  │ Input: [2,7,11,15]  │  │  ┌──────────────────────────┐  │   │
│  │  │ Output: [0,1]       │  │  │ Output                   │  │   │
│  │  │ Explanation: ...    │  │  │ [Submit Button]          │  │   │
│  │  └─────────────────────┘  │  ├──────────────────────────┤  │   │
│  │                           │  │                          │  │   │
│  │  ┌─────────────────────┐  │  │ Test Results:            │  │   │
│  │  │ Example 2:          │  │  │ ✅ Accepted              │  │   │
│  │  │ ...                 │  │  │ All 10 tests passed!     │  │   │
│  │  └─────────────────────┘  │  │                          │  │   │
│  │                           │  └──────────────────────────┘  │   │
│  │  ┌─────────────────────┐  │                                │   │
│  │  │ Constraints:        │  │                                │   │
│  │  │ - 2 <= nums.length  │  │                                │   │
│  │  │ - ...               │  │                                │   │
│  │  └─────────────────────┘  │                                │   │
│  │                           │                                │   │
│  └───────────────────────────┴────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── Header
│   ├── Logo & Title
│   └── Problem Selector (Dropdown)
│
└── CodeEditor (Main Content)
    ├── ProblemDescription (Left - 50%)
    │   ├── Title & Difficulty Badge
    │   ├── Description (HTML)
    │   ├── Examples
    │   │   ├── Example 1
    │   │   ├── Example 2
    │   │   └── Example N...
    │   └── Constraints
    │
    └── EditorPanel (Right - 50%)
        ├── Editor Section (Top ~65%)
        │   ├── Language Dropdown
        │   └── Monaco Editor
        │
        └── Output Section (Bottom ~35%)
            ├── Header
            │   ├── "Output" Label
            │   └── Submit Button
            └── Output Content
                ├── Initial: Placeholder
                ├── Loading: Spinner
                └── Result: Success/Error Message
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                          App.jsx                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ State: currentProblemIndex                                │ │
│  │ Data: sampleProblems[currentProblemIndex]                 │ │
│  └───────────────────────────────────────────────────────────┘ │
│                           │                                     │
│                           ▼                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Props: problem={currentProblem}                           │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┴─────────────────┐
          ▼                                   ▼
┌─────────────────────┐           ┌─────────────────────┐
│ ProblemDescription  │           │   EditorPanel       │
│                     │           │                     │
│ Props:              │           │ Props:              │
│ - problem           │           │ - problemId         │
│                     │           │                     │
│ Displays:           │           │ State:              │
│ - Title             │           │ - language          │
│ - Difficulty        │           │ - code              │
│ - Description       │           │ - output            │
│ - Examples          │           │ - isLoading         │
│ - Constraints       │           │                     │
│                     │           │ Actions:            │
│ (Read-only)         │           │ - Change language   │
│                     │           │ - Edit code         │
│                     │           │ - Submit code       │
│                     │           │ - Display output    │
└─────────────────────┘           └─────────────────────┘
```

## State Management Flow (EditorPanel)

```
User Actions → State Updates → UI Re-renders

1. Language Change:
   User selects language
   → onLanguageChange()
   → setLanguage(newLang)
   → setCode(DEFAULT_CODE[newLang])
   → setOutput(null)
   → Editor updates with new language/code

2. Code Edit:
   User types in editor
   → handleEditorChange(newCode)
   → setCode(newCode)
   → Editor state updated

3. Code Submit:
   User clicks Submit
   → handleSubmitCode()
   → setIsLoading(true)
   → setOutput(null)
   → Submit button shows "Running..."
   → Output shows loading spinner
   
   → API Call (with payload: {code, language, problemId})
   
   → Response received
   → setOutput(result)
   → setIsLoading(false)
   → Output shows result (Success/Error)
   → Submit button back to normal
```

## File Organization

```
client/
│
├── public/              # Static assets (if any)
│
├── src/
│   ├── components/      # React components
│   │   ├── CodeEditor.jsx           # Main container
│   │   ├── ProblemDescription.jsx   # Left panel
│   │   └── EditorPanel.jsx          # Right panel with editor
│   │
│   ├── data/            # Data files
│   │   └── problems.js              # Problem definitions
│   │
│   ├── App.jsx          # Root component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles + Tailwind
│
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
├── README.md            # Project documentation
└── COMPONENT_API.md     # Component reference
```

## Styling Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    index.css                            │
│  - @tailwind base, components, utilities                │
│  - Global reset styles                                  │
│  - Root styles                                          │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌─────────┐    ┌─────────┐    ┌──────────┐
    │   App   │    │ Problem │    │  Editor  │
    │         │    │  Desc   │    │  Panel   │
    │ Utility │    │ Utility │    │ Utility  │
    │ Classes │    │ Classes │    │ Classes  │
    └─────────┘    └─────────┘    └──────────┘

Tailwind Utilities Used:
- Layout: flex, grid, w-1/2, h-full, h-screen
- Spacing: p-4, m-2, space-x-2, gap-4
- Colors: bg-gray-50, text-green-700, border-red-200
- Typography: text-xl, font-bold, leading-relaxed
- Effects: rounded-lg, shadow-md, hover:bg-gray-700
- Responsive: (can be added for mobile views)
```

## User Interaction Flow

```
┌──────────────────────────────────────────────────────────────┐
│ 1. User opens app                                            │
│    → Default: First problem loaded (Two Sum)                 │
│    → Default language: Python                                │
│    → Default code template shown                             │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. User selects different problem (optional)                 │
│    → Dropdown in header                                      │
│    → Problem description updates                             │
│    → Editor code resets to default                           │
│    → Output cleared                                          │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. User selects language (optional)                          │
│    → Dropdown in editor panel                                │
│    → Editor language mode changes                            │
│    → Default code template loaded                            │
│    → Syntax highlighting updates                             │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. User writes code                                          │
│    → Types in Monaco Editor                                  │
│    → Real-time syntax highlighting                           │
│    → Auto-indentation, bracket matching                      │
│    → Code state updates on each change                       │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ 5. User clicks Submit                                        │
│    → Button disabled                                         │
│    → Shows "Running..." with spinner                         │
│    → Output area shows loading state                         │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ 6. Code submission (API call)                                │
│    → Payload: {code, language, problemId}                    │
│    → Sent to backend (simulated in demo)                     │
│    → Waits for response                                      │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ 7. Results displayed                                         │
│    → Success: Green "Accepted" message                       │
│    → Error: Red "Wrong Answer" with details                  │
│    → Button re-enabled                                       │
│    → User can modify and resubmit                            │
└──────────────────────────────────────────────────────────────┘
```

## Color Scheme

```
┌─────────────────────────────────────────────────────────────┐
│ Theme: Light mode with dark editor                          │
├─────────────────────────────────────────────────────────────┤
│ Header:                                                     │
│ - Background: bg-gray-900 (Dark)                            │
│ - Text: text-white                                          │
├─────────────────────────────────────────────────────────────┤
│ Problem Description:                                        │
│ - Background: bg-white                                      │
│ - Text: text-gray-900, text-gray-700                        │
│ - Examples: bg-gray-50, border-gray-200                     │
├─────────────────────────────────────────────────────────────┤
│ Difficulty Badges:                                          │
│ - Easy: bg-green-100, text-green-800, border-green-300      │
│ - Medium: bg-yellow-100, text-yellow-800, border-yellow-300 │
│ - Hard: bg-red-100, text-red-800, border-red-300            │
├─────────────────────────────────────────────────────────────┤
│ Editor:                                                     │
│ - Background: Monaco "vs-dark" theme                        │
│ - Dropdown bar: bg-gray-800                                 │
├─────────────────────────────────────────────────────────────┤
│ Output Section:                                             │
│ - Header: bg-gray-200                                       │
│ - Content: bg-white                                         │
│ - Success: bg-green-50, text-green-700, border-green-200    │
│ - Error: bg-red-50, text-red-700, border-red-200            │
├─────────────────────────────────────────────────────────────┤
│ Buttons:                                                    │
│ - Submit: bg-green-600, hover:bg-green-700                  │
│ - Disabled: bg-gray-400                                     │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Behavior (Current)

```
Current implementation: Fixed split (50/50)
- Left panel: 50% width (w-1/2)
- Right panel: 50% width (w-1/2)

To add responsive behavior, update CodeEditor.jsx:

Desktop (>= 1024px):
- Keep 50/50 split
- className="lg:w-1/2"

Tablet (768px - 1023px):
- Could stack vertically
- className="md:w-full lg:w-1/2"

Mobile (< 768px):
- Stack vertically
- Problem description on top
- Editor below
- className="w-full lg:w-1/2"
```

---

This visual guide should help you understand the structure and flow of the application!
