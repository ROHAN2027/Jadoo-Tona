import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VoiceInterview from '../components/VoiceInterview';

const ProjectInterviewPage = () => {
  const navigate = useNavigate();
  const [interviewComplete, setInterviewComplete] = useState(false);

  const handleInterviewComplete = (data) => {
    console.log('Project Interview Complete:', data);
    setInterviewComplete(true);
    
    // Navigate to results page with data
    setTimeout(() => {
      navigate('/results', { 
        state: { 
          sessionData: data,
          interviewType: 'project'
        } 
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                🚀 Project Deep Dive Interview
                <span className="ml-3 px-2 py-1 text-xs bg-green-600 rounded-full">Live</span>
              </h1>
              <p className="text-sm text-gray-400">AI-powered technical interview on your GitHub project</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Interview Type</div>
              <div className="text-white font-semibold">Project Deep Dive</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {!interviewComplete ? (
          <VoiceInterview 
            interviewType="project" 
            onComplete={handleInterviewComplete}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-2">Interview Complete!</h2>
              <p className="text-gray-400 mb-4">Redirecting to results...</p>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6 text-gray-400">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>This interview analyzes your GitHub repository</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Duration: 20-30 minutes</span>
            </div>
          </div>
          <div className="text-gray-500">
            Powered by Gemini AI & Groq
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInterviewPage;
