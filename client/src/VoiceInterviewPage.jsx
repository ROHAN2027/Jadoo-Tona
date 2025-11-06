import React from 'react';
import VoiceInterview from './components/VoiceInterview';

function VoiceInterviewPage() {
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
}

export default VoiceInterviewPage;
