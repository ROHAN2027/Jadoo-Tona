import React, { createContext, useContext, useState, useEffect } from 'react';

const InterviewContext = createContext();

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within InterviewProvider');
  }
  return context;
};

export const InterviewProvider = ({ children }) => {
  // Load initial state from localStorage if available
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('interviewData');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[InterviewContext] Loaded from localStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('[InterviewContext] Error loading from localStorage:', error);
    }
    return {
      // User info from resume
      name: null,
      email: null,
      githubLink: null,
      
      // Interview progress
      currentStage: null, // 'dsa' | 'conceptual' | 'project' | 'completed'
      completedStages: [],
      
      // Session tracking
      sessionId: null,
      startTime: null,
      
      // Preloaded data
      githubQuestions: null,
      githubQuestionsLoading: false,
      githubQuestionsError: null,
    };
  };

  const [interviewData, setInterviewData] = useState(loadFromStorage);

  // Persist to localStorage whenever interviewData changes
  useEffect(() => {
    try {
      localStorage.setItem('interviewData', JSON.stringify(interviewData));
      console.log('[InterviewContext] Saved to localStorage:', {
        name: interviewData.name,
        githubLink: interviewData.githubLink,
        currentStage: interviewData.currentStage
      });
    } catch (error) {
      console.error('[InterviewContext] Error saving to localStorage:', error);
    }
  }, [interviewData]);

  // Initialize session on mount
  useEffect(() => {
    if (!interviewData.sessionId) {
      setInterviewData(prev => ({
        ...prev,
        sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));
    }
  }, []);

  const setUserInfo = (name, email, githubLinks) => {
    console.log('[InterviewContext] setUserInfo called with:', { name, email, githubLinks });
    
    // Handle both array and single link
    let selectedGithubLink = null;
    if (githubLinks) {
      if (Array.isArray(githubLinks) && githubLinks.length > 0) {
        selectedGithubLink = githubLinks[Math.floor(Math.random() * githubLinks.length)];
      } else if (typeof githubLinks === 'string') {
        selectedGithubLink = githubLinks;
      }
    }

    console.log('[InterviewContext] Selected GitHub link:', selectedGithubLink);

    setInterviewData(prev => ({
      ...prev,
      name,
      email,
      githubLink: selectedGithubLink,
      startTime: new Date().toISOString()
    }));

    // Force immediate localStorage save
    setTimeout(() => {
      console.log('[InterviewContext] Verifying localStorage after setUserInfo');
      const stored = localStorage.getItem('interviewData');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[InterviewContext] localStorage verified:', {
          name: parsed.name,
          githubLink: parsed.githubLink
        });
      }
    }, 100);
  };

  const setCurrentStage = (stage) => {
    setInterviewData(prev => ({
      ...prev,
      currentStage: stage
    }));
  };

  const completeStage = (stage) => {
    setInterviewData(prev => ({
      ...prev,
      completedStages: [...prev.completedStages, stage]
    }));
  };

  const preloadGithubQuestions = async () => {
    // Use functional update to get the latest state
    setInterviewData(prev => {
      // Check if already loaded, loading, or no link
      if (!prev.githubLink || prev.githubQuestions || prev.githubQuestionsLoading) {
        console.log('[InterviewContext] Skipping preload:', {
          hasLink: !!prev.githubLink,
          hasQuestions: !!prev.githubQuestions,
          isLoading: prev.githubQuestionsLoading
        });
        return prev; // No state change
      }

      console.log('[InterviewContext] Starting GitHub questions preload for:', prev.githubLink);
      
      // Start loading - this prevents duplicate calls
      const newState = {
        ...prev,
        githubQuestionsLoading: true,
        githubQuestionsError: null
      };

      // Fetch questions asynchronously
      (async () => {
        try {
          const response = await fetch('http://localhost:8000/generate-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repo_url: prev.githubLink })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch GitHub questions: ${response.status} ${errorText}`);
          }

          const data = await response.json();
          console.log('[InterviewContext] ✓ GitHub questions loaded:', data.questions?.substring(0, 100) + '...');
          
          setInterviewData(current => ({
            ...current,
            githubQuestions: data.questions,
            githubQuestionsLoading: false
          }));
        } catch (error) {
          console.error('[InterviewContext] Error preloading GitHub questions:', error);
          setInterviewData(current => ({
            ...current,
            githubQuestionsError: error.message,
            githubQuestionsLoading: false
          }));
        }
      })();

      return newState;
    });
  };

  const resetInterview = () => {
    const resetData = {
      name: null,
      email: null,
      githubLink: null,
      currentStage: null,
      completedStages: [],
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime: null,
      githubQuestions: null,
      githubQuestionsLoading: false,
      githubQuestionsError: null,
    };
    setInterviewData(resetData);
    // Clear localStorage
    localStorage.removeItem('interviewData');
    console.log('[InterviewContext] Interview reset, localStorage cleared');
  };

  const value = {
    ...interviewData,
    setUserInfo,
    setCurrentStage,
    completeStage,
    preloadGithubQuestions,
    resetInterview
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};

export default InterviewContext;
