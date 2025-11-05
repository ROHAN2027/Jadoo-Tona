import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

// Default code templates for each language
const DEFAULT_CODE = {
  python: `def solution(nums, target):
    # Write your code here
    pass

# Test your solution
print(solution([2,7,11,15], 9))`,
  javascript: `function solution(nums, target) {
    // Write your code here
}

// Test your solution
console.log(solution([2,7,11,15], 9));`,
  java: `class Solution {
    public int[] solution(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] result = sol.solution(new int[]{2,7,11,15}, 9);
        System.out.println(java.util.Arrays.toString(result));
    }
}`,
  cpp: `#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> solution(vector<int>& nums, int target) {
        // Write your code here
        return {};
    }
};

int main() {
    Solution sol;
    vector<int> nums = {2,7,11,15};
    vector<int> result = sol.solution(nums, 9);
    return 0;
}`
};

const EditorPanel = ({ problemId, onSkip, onSubmit, timeRemaining }) => {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(DEFAULT_CODE['python']);
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editorHeight, setEditorHeight] = useState(60); // Percentage
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);
  const panelRef = React.useRef(null);

  // Handle language change
  const onLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    setCode(DEFAULT_CODE[newLanguage]);
    setOutput(null);
  };

  // Handle editor change
  const handleEditorChange = (value) => {
    setCode(value);
  };

  // Handle vertical resize
  const handleVerticalMouseDown = (e) => {
    setIsDraggingVertical(true);
    e.preventDefault();
  };

  const handleVerticalMouseMove = (e) => {
    if (!isDraggingVertical || !panelRef.current) return;

    const panel = panelRef.current;
    const panelRect = panel.getBoundingClientRect();
    const newEditorHeight = ((e.clientY - panelRect.top) / panelRect.height) * 100;

    // Limit height between 30% and 80%
    if (newEditorHeight >= 30 && newEditorHeight <= 80) {
      setEditorHeight(newEditorHeight);
    }
  };

  const handleVerticalMouseUp = () => {
    setIsDraggingVertical(false);
  };

  // Add event listeners for vertical dragging
  React.useEffect(() => {
    if (isDraggingVertical) {
      document.addEventListener('mousemove', handleVerticalMouseMove);
      document.addEventListener('mouseup', handleVerticalMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleVerticalMouseMove);
      document.removeEventListener('mouseup', handleVerticalMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }

    return () => {
      document.removeEventListener('mousemove', handleVerticalMouseMove);
      document.removeEventListener('mouseup', handleVerticalMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isDraggingVertical]);

  // Handle skip button
  const handleSkipQuestion = () => {
    if (onSkip) {
      onSkip(code);
    }
  };

  // Handle code submission
  const handleSubmitCode = async () => {
    setIsLoading(true);
    setOutput(null);

    try {
      // Construct the payload
      const payload = {
        code: code,
        language: language,
        problemId: problemId,
        timeRemaining: timeRemaining,
      };

      // [API CALL PLACEHOLDER]
      // Replace this with your actual API endpoint
      // const response = await fetch('YOUR_API_URL/submit-code', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(payload),
      // });
      // const result = await response.json();

      // Simulated API response for demonstration
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Simulate different responses randomly
      const random = Math.random();
      const result = random > 0.5
        ? {
            status: 'Accepted',
            message: 'All 10 test cases passed!',
            testsPassed: 10,
            totalTests: 10,
          }
        : {
            status: 'Wrong Answer',
            message: 'Test case 3 failed',
            testsPassed: 2,
            totalTests: 10,
            failedInput: '[3,2,4], target = 6',
            expectedOutput: '[1,2]',
            actualOutput: '[0,1]',
          };

      setOutput(result);
      
      // Move to next question after showing result
      setTimeout(() => {
        if (onSubmit) {
          onSubmit(code, result);
        }
      }, 3000); // Show result for 3 seconds before moving to next
    } catch (error) {
      setOutput({
        status: 'Error',
        message: error.message || 'An error occurred while submitting your code.',
      });
      setIsLoading(false);
    } finally {
      // Keep loading state until moving to next question
    }
  };

  // Render output content based on state
  const renderOutput = () => {
    // Time warning (last minute)
    const showTimeWarning = timeRemaining !== null && timeRemaining <= 60 && timeRemaining > 0;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-600">Running test cases...</p>
          </div>
        </div>
      );
    }

    if (!output) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
          {showTimeWarning && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg animate-pulse">
              <p className="text-red-700 font-semibold flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Less than 1 minute remaining!
              </p>
            </div>
          )}
          <p>Click "Submit" to evaluate your solution or "Skip" to move to next question</p>
        </div>
      );
    }

    const isSuccess = output.status === 'Accepted';
    const isError = output.status === 'Wrong Answer' || output.status === 'Error';

    return (
      <div className="p-4">
        <div
          className={`p-4 rounded-lg mb-4 ${
            isSuccess
              ? 'bg-green-50 border border-green-200'
              : isError
              ? 'bg-red-50 border border-red-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          <div className="flex items-center mb-2">
            <span
              className={`text-lg font-semibold ${
                isSuccess
                  ? 'text-green-700'
                  : isError
                  ? 'text-red-700'
                  : 'text-yellow-700'
              }`}
            >
              {output.status}
            </span>
          </div>
          <p
            className={`${
              isSuccess
                ? 'text-green-700'
                : isError
                ? 'text-red-700'
                : 'text-yellow-700'
            }`}
          >
            {output.message}
          </p>

          {output.testsPassed !== undefined && (
            <p className="mt-2 text-sm text-gray-600">
              Tests Passed: {output.testsPassed}/{output.totalTests}
            </p>
          )}

          {output.failedInput && (
            <div className="mt-3 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">Input: </span>
                <code className="bg-white px-2 py-1 rounded">
                  {output.failedInput}
                </code>
              </p>
              <p className="text-gray-700 mt-1">
                <span className="font-medium">Expected: </span>
                <code className="bg-white px-2 py-1 rounded">
                  {output.expectedOutput}
                </code>
              </p>
              <p className="text-gray-700 mt-1">
                <span className="font-medium">Your Output: </span>
                <code className="bg-white px-2 py-1 rounded">
                  {output.actualOutput}
                </code>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div ref={panelRef} className="h-full flex flex-col bg-gray-50 relative">
      {/* Editor Section */}
      <div 
        className="flex flex-col border-b border-gray-300"
        style={{ height: `${editorHeight}%` }}
      >
        {/* Language Selector */}
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between flex-shrink-0">
          <select
            value={language}
            onChange={onLanguageChange}
            className="bg-gray-700 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language}
            value={code}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>

      {/* Horizontal Resize Handle */}
      <div
        className="h-1 bg-gray-300 hover:bg-blue-500 cursor-row-resize flex-shrink-0 relative group transition-colors"
        onMouseDown={handleVerticalMouseDown}
      >
        <div className="absolute inset-0 -top-1 -bottom-1" />
        {/* Dots indicator in the middle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div 
        className="flex flex-col"
        style={{ height: `${100 - editorHeight}%` }}
      >
        {/* Output Header with Action Buttons */}
        <div className="bg-gray-200 px-4 py-2 flex items-center justify-between border-b border-gray-300 flex-shrink-0">
          <h3 className="font-semibold text-gray-800">Output</h3>
          <div className="flex items-center space-x-3">
            {/* Skip Button */}
            <button
              onClick={handleSkipQuestion}
              disabled={isLoading}
              className={`px-4 py-2 rounded font-medium flex items-center space-x-2 ${
                isLoading
                  ? 'bg-gray-300 cursor-not-allowed text-gray-400'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
              title="Skip this question and move to next"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              <span>Skip</span>
            </button>

            {/* Submit Button */}
            <button
              onClick={handleSubmitCode}
              disabled={isLoading}
              className={`px-4 py-2 rounded font-medium flex items-center space-x-2 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              title="Submit your solution"
            >
              {isLoading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Submit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Content */}
        <div className="flex-1 overflow-y-auto bg-white">{renderOutput()}</div>
      </div>
    </div>
  );
};

export default EditorPanel;
