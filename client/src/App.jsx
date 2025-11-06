import React, { useState, useEffect } from 'react';
import CodeEditor from './components/CodeEditor';

const API_BASE_URL = 'http://localhost:5000/api/problems';

function App() {
  // Interview state
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [completedProblems, setCompletedProblems] = useState([]);
  const [skippedProblems, setSkippedProblems] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null); // Time in seconds
  const [interviewComplete, setInterviewComplete] = useState(false);
  
  // Questions from backend
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const totalQuestions = 2; // We'll fetch 2 questions
  
  const currentProblem = problems[currentProblemIndex];

  // Fetch questions from backend on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        
        // Step 1: Get random question titles and time limits
        const randomResponse = await fetch(`${API_BASE_URL}/random/questions?count=${totalQuestions}`);
        if (!randomResponse.ok) {
          throw new Error('Failed to fetch random questions');
        }
        const randomData = await randomResponse.json();
        
        // Step 2: Fetch full details for each question
        const questionDetailsPromises = randomData.questions.map(async (q) => {
          const detailResponse = await fetch(`${API_BASE_URL}/${encodeURIComponent(q.title)}`);
          if (!detailResponse.ok) {
            throw new Error(`Failed to fetch details for ${q.title}`);
          }
          const details = await detailResponse.json();
          
          // Add timeLimit from the random questions response (in seconds)
          return {
            ...details,
            timeLimit: q.timeLimit * 60 // Convert minutes to seconds
          };
        });
        
        const questionsWithDetails = await Promise.all(questionDetailsPromises);
        setProblems(questionsWithDetails);
        
        // Set initial timer based on first question's time limit
        if (questionsWithDetails.length > 0) {
          setTimeRemaining(questionsWithDetails[0].timeLimit);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Update timer when question changes
  useEffect(() => {
    if (problems.length > 0 && currentProblemIndex < problems.length) {
      setTimeRemaining(problems[currentProblemIndex].timeLimit);
    }
  }, [currentProblemIndex, problems]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || interviewComplete) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up! Auto-submit
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, interviewComplete]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Get timer color based on remaining time
  const getTimerColor = () => {
    if (timeRemaining === null) return 'text-gray-300';
    if (timeRemaining <= 60) return 'text-red-500'; // Last minute - red
    if (timeRemaining <= 300) return 'text-yellow-500'; // Last 5 mins - yellow
    return 'text-green-500'; // More than 5 mins - green
  };

  // Handle skip
  const handleSkip = (code) => {
    setSkippedProblems([...skippedProblems, currentProblemIndex]);
    moveToNextQuestion();
  };

  // Handle submit
  const handleSubmit = (code, result) => {
    setCompletedProblems([...completedProblems, currentProblemIndex]);
    // TODO: Send to backend API
    moveToNextQuestion();
  };

  // Handle auto-submit when timer expires
  const handleAutoSubmit = () => {
    setCompletedProblems([...completedProblems, currentProblemIndex]);
    // TODO: Send to backend API with time_expired flag
    moveToNextQuestion();
  };

  // Move to next question or complete interview
  const moveToNextQuestion = () => {
    if (currentProblemIndex < totalQuestions - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    } else {
      // Interview complete
      setInterviewComplete(true);
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading interview questions...</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
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
  }

  // Interview complete screen
  if (interviewComplete) {
    return (
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
  }

  // Check if problems are loaded
  if (problems.length === 0) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">No questions available</div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Jadutona</h1>
          <span className="text-gray-400">|</span>
          <span className="text-gray-300">AI Interview Platform</span>
        </div>
        
        {/* Interview Progress & Timer */}
        <div className="flex items-center space-x-6">
          {/* Progress */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Question</span>
            <span className="text-lg font-bold text-white">
              {currentProblemIndex + 1} / {totalQuestions}
            </span>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-600"></div>

          {/* Timer */}
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-lg font-mono font-bold ${getTimerColor()}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalQuestions }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  completedProblems.includes(index)
                    ? 'bg-green-500'
                    : skippedProblems.includes(index)
                    ? 'bg-yellow-500'
                    : index === currentProblemIndex
                    ? 'bg-blue-500'
                    : 'bg-gray-600'
                }`}
                title={
                  completedProblems.includes(index)
                    ? 'Completed'
                    : skippedProblems.includes(index)
                    ? 'Skipped'
                    : index === currentProblemIndex
                    ? 'Current'
                    : 'Pending'
                }
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-60px)]">
        <CodeEditor 
          problem={currentProblem}
          onSkip={handleSkip}
          onSubmit={handleSubmit}
          timeRemaining={timeRemaining}
        />
      </main>
    </div>
  );
}

export default App;
