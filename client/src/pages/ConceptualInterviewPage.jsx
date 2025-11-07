import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';
import VoiceInterview from '../components/VoiceInterview';

const ConceptualInterviewPage = () => {
  const navigate = useNavigate();
  const { name, setCurrentStage, completeStage, preloadGithubQuestions, githubLink } = useInterview();
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const hasPreloaded = React.useRef(false);

  // Set current stage on mount
  useEffect(() => {
    setCurrentStage('conceptual');
  }, [setCurrentStage]);

  // Preload GitHub questions ONCE if not already loaded
  useEffect(() => {
    if (githubLink && !interviewCompleted && !hasPreloaded.current) {
      console.log('[ConceptualInterviewPage] Triggering preload for:', githubLink);
      hasPreloaded.current = true;
      preloadGithubQuestions();
    }
  }, [githubLink, preloadGithubQuestions, interviewCompleted]);

  const handleInterviewComplete = (data) => {
    console.log('Conceptual interview completed:', data);
    setSessionData(data);
    setInterviewCompleted(true);
    
    // Mark conceptual as complete and move to Project round
    setTimeout(() => {
      completeStage('conceptual');
      setCurrentStage('project');
      navigate('/project');
    }, 3000);
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {!interviewCompleted ? (
        <VoiceInterview 
          interviewType="conceptual"
          onComplete={handleInterviewComplete}
          onBack={handleGoBack}
          candidateName={name}
        />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-xl">Moving to Project Interview...</p>
            <p className="text-sm text-gray-400 mt-2">Get ready for the final round!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConceptualInterviewPage;
