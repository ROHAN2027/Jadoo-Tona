# Jadutona - AI Interview Code Editor

A LeetCode-style code editor built with React, Vite, and Monaco Editor for conducting technical interviews and practicing Data Structures & Algorithms problems.

## 🚀 Features

- **Split-Screen Interface**: Problem description on the left, code editor on the right
- **Multi-Language Support**: Python, JavaScript, Java, and C++
- **Monaco Editor Integration**: VS Code-like editing experience with syntax highlighting
- **Real-Time Code Execution**: Submit and test code with visual feedback
- **Responsive Design**: Built with Tailwind CSS for a modern UI
- **Multiple Problem Sets**: Switch between different DSA problems

## 📁 Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── CodeEditor.jsx       # Main split-screen component
│   │   ├── ProblemDescription.jsx  # Left panel - problem details
│   │   └── EditorPanel.jsx      # Right panel - editor & output
│   ├── data/
│   │   └── problems.js          # Sample DSA problems
│   ├── App.jsx                  # Main application component
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global styles with Tailwind
├── index.html                   # HTML template
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── postcss.config.js           # PostCSS configuration
```

## 🛠️ Installation

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🎯 Usage

### Selecting a Problem
Use the dropdown in the header to switch between different problems.

### Writing Code
1. Select your preferred programming language from the dropdown
2. Write your solution in the Monaco editor
3. The default code template will be loaded for each language

### Running Code
1. Click the "Submit" button to execute your code
2. View the output in the bottom panel
3. Results show:
   - **Accepted**: All test cases passed ✅
   - **Wrong Answer**: Failed test cases with details ❌
   - **Error**: Runtime or compilation errors

## 🔌 API Integration

Currently, the code submission uses a simulated API response. To integrate with a real backend:

1. Open `src/components/EditorPanel.jsx`
2. Locate the `handleSubmitCode` function
3. Replace the simulated response with your API call:

```javascript
const response = await fetch('YOUR_API_URL/submit-code', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});
const result = await response.json();
```

### Expected API Response Format

```javascript
{
  "status": "Accepted" | "Wrong Answer" | "Error",
  "message": "Description of the result",
  "testsPassed": 10,
  "totalTests": 10,
  // For failed test cases:
  "failedInput": "[3,2,4], target = 6",
  "expectedOutput": "[1,2]",
  "actualOutput": "[0,1]"
}
```

## 📝 Adding New Problems

To add new problems, edit `src/data/problems.js`:

```javascript
{
  id: 5,
  title: 'Your Problem Title',
  difficulty: 'Easy' | 'Medium' | 'Hard',
  description: `<p>HTML formatted problem description</p>`,
  examples: [
    {
      input: 'nums = [1,2,3]',
      output: '[1,2,3]',
      explanation: 'Optional explanation'
    }
  ],
  constraints: [
    'Constraint 1',
    'Constraint 2'
  ]
}
```

## 🎨 Customization

### Changing Editor Theme
Modify the `theme` prop in `src/components/EditorPanel.jsx`:
```javascript
<Editor
  theme="vs-dark"  // Options: "vs-dark", "light", "hc-black"
  // ... other props
/>
```

### Adding More Languages
1. Add the language to the dropdown in `EditorPanel.jsx`
2. Add a default code template to the `DEFAULT_CODE` object

### Styling
The project uses Tailwind CSS. Modify classes in components or extend the theme in `tailwind.config.js`.

## 🔧 Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📦 Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Monaco Editor** - Code editor (VS Code engine)
- **Tailwind CSS** - Styling
- **PostCSS & Autoprefixer** - CSS processing

## 🚀 Next Steps

- [ ] Integrate with backend API for real code execution
- [ ] Add authentication and user management
- [ ] Implement test case management
- [ ] Add code submission history
- [ ] Support for more programming languages
- [ ] Add collaborative coding features
- [ ] Implement video/audio for interviews
- [ ] Add timer and interview session management

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

**Note**: This is a frontend application. For full functionality, you'll need to connect it to a backend service that can execute code safely in a sandboxed environment.
