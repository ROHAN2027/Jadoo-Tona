import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VoiceInterview from '../components/VoiceInterview';

const ConceptualInterviewPage = () => {
  const navigate = useNavigate();
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  const handleInterviewComplete = (data) => {
    console.log('Interview completed:', data);
    setSessionData(data);
    setInterviewCompleted(true);
    
    // Navigate to results page with session data
    navigate('/results', { 
      state: { 
        sessionId: data.sessionId,
        sessionType: 'conceptual',
        ...data 
      } 
    });
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
        />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-xl">Generating your results...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConceptualInterviewPage;
