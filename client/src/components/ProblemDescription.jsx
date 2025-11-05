import React, { useState } from 'react';

const ProblemDescription = ({ problem }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const getDifficultyColor = (difficulty) => {
    const level = difficulty.toLowerCase();
    if (isDarkMode) {
      switch (level) {
        case 'easy':
          return 'bg-green-900 text-green-300 border-green-700';
        case 'medium':
          return 'bg-yellow-900 text-yellow-300 border-yellow-700';
        case 'hard':
          return 'bg-red-900 text-red-300 border-red-700';
        default:
          return 'bg-gray-700 text-gray-300 border-gray-600';
      }
    } else {
      switch (level) {
        case 'easy':
          return 'bg-green-100 text-green-800 border-green-300';
        case 'medium':
          return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'hard':
          return 'bg-red-100 text-red-800 border-red-300';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    }
  };

  return (
    <div className={`h-full overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300`}>
      {/* Theme Toggle Button */}
      <div className={`sticky top-0 z-10 px-6 py-3 flex justify-end ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-sm font-medium">Light</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span className="text-sm font-medium">Dark</span>
            </>
          )}
        </button>
      </div>

      <div className="p-6">
        {/* Title and Difficulty */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {problem.id}. {problem.title}
          </h1>
          <span
            className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getDifficultyColor(
              problem.difficulty
            )}`}
          >
            {problem.difficulty}
          </span>
        </div>

        {/* Description */}
        <div className="mb-6">
          <div
            className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            dangerouslySetInnerHTML={{ __html: problem.description }}
          />
        </div>

        {/* Examples */}
        {problem.examples && problem.examples.length > 0 && (
          <div className="space-y-4">
            {problem.examples.map((example, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Example {index + 1}:
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Input:{' '}
                    </span>
                    <code
                      className={`px-2 py-1 rounded text-sm ${
                        isDarkMode
                          ? 'bg-gray-900 text-green-400'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {example.input}
                    </code>
                  </div>
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Output:{' '}
                    </span>
                    <code
                      className={`px-2 py-1 rounded text-sm ${
                        isDarkMode
                          ? 'bg-gray-900 text-green-400'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {example.output}
                    </code>
                  </div>
                  {example.explanation && (
                    <div>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Explanation:{' '}
                      </span>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {example.explanation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Constraints */}
        {problem.constraints && (
          <div className="mt-6">
            <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Constraints:
            </h3>
            <ul className={`list-disc list-inside space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {problem.constraints.map((constraint, index) => (
                <li key={index} className="text-sm">
                  <code
                    className={`px-1 rounded ${
                      isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {constraint}
                  </code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDescription;
