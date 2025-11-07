import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  }, [interviewData.sessionId]);

  const setUserInfo = useCallback((name, email, githubLinks) => {
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
  }, []);

  const setCurrentStage = useCallback((stage) => {
    setInterviewData(prev => ({
      ...prev,
      currentStage: stage
    }));
  }, []);

  const completeStage = useCallback((stage) => {
    setInterviewData(prev => ({
      ...prev,
      completedStages: [...prev.completedStages, stage]
    }));
  }, []);

  const preloadGithubQuestions = useCallback(async () => {
    // NOTE: This function is intentionally a no-op
    // GitHub questions are now fetched by WebSocket handler on backend
    // to avoid duplicate API calls and ensure structured format
    console.log('[InterviewContext] preloadGithubQuestions called - delegating to WebSocket handler');
  }, []);

  const resetInterview = useCallback(() => {
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
  }, []);

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
