import React from 'react';
import VoiceInterview from './components/VoiceInterview';
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';
import OriginalApp from './App';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Jadoo-Tona Interview Platform</h1>
        <div className="space-y-4">
          <Link 
            to="/dsa" 
            className="block w-64 mx-auto bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
          >
            DSA Interview (Coding)
          </Link>
          <Link 
            to="/voice" 
            className="block w-64 mx-auto bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold"
          >
            Voice Interview (Conceptual)
          </Link>
        </div>
      </div>
    </div>
  );
};

const VoiceInterviewPage = () => {
  const handleInterviewComplete = (data) => {
    console.log('Interview completed:', data);
    alert(`Interview Complete!\nScore: ${data.totalScore}/${data.maxScore}\nQuestions Answered: ${data.questionsAnswered}`);
  };

  return (
    <VoiceInterview 
      interviewType="conceptual"
      onComplete={handleInterviewComplete}
    />
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/dsa",
    element: <OriginalApp />,
  },
  {
    path: "/voice",
    element: <VoiceInterviewPage />,
  },
]);

function TestApp() {
  return <RouterProvider router={router} />;
}

export default TestApp;
