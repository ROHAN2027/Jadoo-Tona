import React from 'react';

/**
 * Loading Screen Component
 */
export const LoadingScreen = () => (
  <div className="h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
      <p className="text-white text-xl">Loading interview questions...</p>
    </div>
  </div>
);

/**
 * Error Screen Component
 */
export const ErrorScreen = ({ error }) => (
  <div className="h-screen bg-gray-900 flex items-center justify-center">
    <div className="bg-red-900 text-white rounded-lg shadow-xl p-8 max-w-md text-center">
      <h1 className="text-2xl font-bold mb-4">Error Loading Questions</h1>
      <p className="mb-4">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-white text-red-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100"
      >
        Retry
      </button>
    </div>
  </div>
);

/**
 * Interview Complete Screen Component
 */
export const InterviewCompleteScreen = ({ totalQuestions, completedProblems, skippedProblems }) => (
  <div className="h-screen bg-gray-900 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
      <div className="mb-6">
        <svg className="w-20 h-20 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Interview Complete!</h1>
      <p className="text-gray-600 mb-6">
        You've completed all {totalQuestions} questions.
      </p>
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">Completed:</span>
          <span className="font-semibold text-green-600">{completedProblems.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Skipped:</span>
          <span className="font-semibold text-yellow-600">{skippedProblems.length}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500">
        Your responses have been submitted for evaluation.
      </p>
    </div>
  </div>
);

/**
 * No Questions Screen Component
 */
export const NoQuestionsScreen = () => (
  <div className="h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-white text-xl">No questions available</div>
  </div>
);
