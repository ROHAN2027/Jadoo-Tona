import React, { useState, useEffect, useRef } from 'react';

const VoiceInterview = ({ 
  interviewType = 'conceptual', 
  onComplete,
  preloadedQuestions = null,
  githubRepo = null,
  candidateName = null 
}) => {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  // Interview state
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [questionContext, setQuestionContext] = useState('');
  const [isFollowUp, setIsFollowUp] = useState(false);
  
  // Project interview specific - use prop if provided
  const [repoUrl, setRepoUrl] = useState(githubRepo || '');
  const [repoInputError, setRepoInputError] = useState(null);
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Feedback state
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  
  // Error state
  const [error, setError] = useState(null);

  // Refs
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const hasAutoStarted = useRef(false);

  // Connect WebSocket on mount
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      stopRecording();
    };
  }, []);

  // Auto-start project interview if GitHub repo is preloaded
  useEffect(() => {
    if (
      interviewType === 'project' && 
      githubRepo && 
      !interviewStarted && 
      isConnected && 
      !hasAutoStarted.current
    ) {
      hasAutoStarted.current = true;
      // Small delay to ensure WebSocket is fully ready
      setTimeout(() => {
        startProjectInterview();
      }, 500);
    }
  }, [githubRepo, interviewStarted, isConnected, interviewType]);

  /**
   * Connect to WebSocket server
   */
  const connectWebSocket = () => {
    try {
      console.log('[WebSocket] Attempting connection to ws://localhost:5000/ws/voice');
      const ws = new WebSocket('ws://localhost:5000/ws/voice');
      
      ws.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WebSocket] Received:', data.type);
          handleWebSocketMessage(data);
        } catch (err) {
          console.error('[WebSocket] Error parsing message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setError('WebSocket connection error. Please ensure backend is running on port 5000.');
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected. Code:', event.code, 'Reason:', event.reason);
        setIsConnected(false);
        
        // Only auto-reconnect if:
        // 1. Interview hasn't started yet
        // 2. Connection was not closed intentionally (code 1000 = normal closure)
        // 3. Not already attempting to reconnect
        if (!interviewStarted && event.code !== 1000 && (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)) {
          console.log('[WebSocket] Will attempt reconnect in 3 seconds...');
          setTimeout(() => {
            // Double-check we're still not connected before reconnecting
            if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
              console.log('[WebSocket] Reconnecting...');
              connectWebSocket();
            }
          }, 3000);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WebSocket] Failed to create connection:', err);
      setError(`Failed to connect to WebSocket: ${err.message}`);
      setIsConnected(false);
    }
  };

  /**
   * Handle incoming WebSocket messages
   */
  const handleWebSocketMessage = (data) => {
    console.log('Received:', data.type);

    switch (data.type) {
      case 'connected':
        setSessionId(data.sessionId);
        break;

      case 'ai_question':
        setCurrentQuestion(data.text);
        setQuestionNumber(data.questionNumber);
        setTotalQuestions(data.totalQuestions);
        setQuestionContext(data.context || '');
        setIsFollowUp(data.isFollowUp || false);
        setTranscript(''); // Clear previous answer
        setLastEvaluation(null);
        break;

      case 'audio_stream_start':
        setIsAISpeaking(true);
        audioQueueRef.current = [];
        break;

      case 'audio_chunk':
        // Just buffer the chunks, don't play yet
        audioQueueRef.current.push(data.data);
        break;

      case 'audio_stream_end':
        // Now play all buffered audio at once
        setIsAISpeaking(false);
        playAudioQueue();
        break;

      case 'transcription':
        setTranscript(data.text);
        break;

      case 'evaluation':
        setLastEvaluation({
          score: data.score,
          feedback: data.feedback
        });
        setCurrentScore(data.currentScore);
        break;

      case 'interview_complete':
        handleInterviewComplete(data);
        break;

      case 'error':
        setError(data.message);
        break;

      default:
        console.warn('Unknown message type:', data.type);
    }
  };

  /**
   * Start the interview
   */
  const startInterview = () => {
    if (!wsRef.current || !isConnected) {
      setError('Not connected to server');
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'start_interview',
      interviewType: interviewType
    }));

    setInterviewStarted(true);
  };

  /**
   * Start project interview with GitHub repo
   */
  const startProjectInterview = () => {
    if (!wsRef.current || !isConnected) {
      setError('Not connected to server');
      return;
    }

    // Validate GitHub URL
    if (!repoUrl.match(/github\.com\/[\w-]+\/[\w-]+/)) {
      setRepoInputError('Please enter a valid GitHub repository URL');
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'start_project_interview',
      repoUrl: repoUrl,
      userId: 'anonymous'
    }));

    setInterviewStarted(true);
    setRepoInputError(null);
  };

  /**
   * Start recording audio
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create MediaRecorder with appropriate MIME type
      const options = { mimeType: 'audio/webm' };
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          // Convert blob to base64 and send
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            wsRef.current.send(JSON.stringify({
              type: 'audio_chunk',
              data: base64,
              format: 'webm'
            }));
          };
          reader.readAsDataURL(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Send audio_end message
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'audio_end' }));
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording and send chunks every 1000ms
      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setError(null);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Microphone access denied or unavailable');
    }
  };

  /**
   * Stop recording audio
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  /**
   * Play audio queue with improved buffering - concatenates all chunks into single buffer
   */
  const playAudioQueue = async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isPlayingRef.current = true;

    // Initialize AudioContext if needed
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;

    try {
      // Concatenate all base64 chunks into a single binary string first
      let allBinaryData = '';
      while (audioQueueRef.current.length > 0) {
        const base64Audio = audioQueueRef.current.shift();
        allBinaryData += atob(base64Audio);
      }

      // Convert concatenated string to ArrayBuffer
      const len = allBinaryData.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = allBinaryData.charCodeAt(i);
      }

      // Decode the entire audio as a single buffer
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);

      // Play the single concatenated buffer (no gaps, no glitches!)
      await playSingleAudioBuffer(audioContext, audioBuffer);

    } catch (err) {
      console.error('Error playing audio:', err);
    }

    isPlayingRef.current = false;
  };

  /**
   * Play a single audio buffer
   */
  const playSingleAudioBuffer = (context, buffer) => {
    return new Promise((resolve) => {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.onended = resolve;
      source.start(0);
    });
  };

  /**
   * Skip current question
   */
  const skipQuestion = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'skip_question' }));
      setTranscript('[Skipped]');
    }
  };

  /**
   * Handle interview completion
   */
  const handleInterviewComplete = (data) => {
    console.log('Interview complete:', data);
    if (onComplete) {
      onComplete(data);
    }
  };

  return (
    <div className="voice-interview min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {interviewType === 'conceptual' ? 'Conceptual' : 'Project'} Interview
          </h1>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm ${
              isConnected ? 'bg-green-600' : wsRef.current?.readyState === WebSocket.CONNECTING ? 'bg-yellow-600' : 'bg-red-600'
            }`}>
              {isConnected ? '● Connected' : wsRef.current?.readyState === WebSocket.CONNECTING ? '● Connecting...' : '● Disconnected'}
            </div>
            <div className="text-lg font-semibold">
              Score: {currentScore}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Start Interview Button */}
        {!interviewStarted && isConnected && (
          <div className="bg-gray-800 rounded-lg p-8 text-center mb-6">
            <h2 className="text-2xl mb-4">Ready to begin?</h2>
            
            {/* Project Interview: Show Repo Input */}
            {interviewType === 'project' ? (
              <>
                <p className="text-gray-400 mb-6">
                  Enter your GitHub repository URL to start a project-specific technical interview.
                </p>
                <div className="max-w-2xl mx-auto mb-6">
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-2"
                  />
                  {repoInputError && (
                    <p className="text-red-400 text-sm text-left">{repoInputError}</p>
                  )}
                  <p className="text-gray-500 text-sm text-left mt-2">
                    💡 The AI will analyze your repository and ask {totalQuestions} questions about your project
                  </p>
                </div>
                <button
                  onClick={startProjectInterview}
                  disabled={!repoUrl.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  Analyze Repository & Start Interview
                </button>
              </>
            ) : (
              /* Conceptual Interview */
              <>
                <p className="text-gray-400 mb-6">
                  You'll be asked {totalQuestions} questions. You can answer using voice or skip questions.
                </p>
                <button
                  onClick={startInterview}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg"
                >
                  Start Interview
                </button>
              </>
            )}
          </div>
        )}

        {/* Interview Progress */}
        {interviewStarted && (
          <>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Question {questionNumber} of {totalQuestions}</span>
                <span>{Math.round((questionNumber / totalQuestions) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Question */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  {/* Follow-up Badge */}
                  {isFollowUp && (
                    <div className="flex items-center text-yellow-400 text-sm mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Follow-up Question
                    </div>
                  )}
                  
                  <h3 className="text-xl font-semibold mb-2">Question:</h3>
                  <p className="text-lg text-gray-300">{currentQuestion || 'Loading question...'}</p>
                  
                  {/* Show context for project questions */}
                  {questionContext && (
                    <div className="mt-3 p-3 bg-gray-900 rounded border-l-4 border-blue-500">
                      <p className="text-sm text-gray-400">
                        <span className="text-blue-400 font-semibold">💡 Context:</span> {questionContext}
                      </p>
                    </div>
                  )}
                  
                  {isAISpeaking && (
                    <div className="mt-3 flex items-center text-blue-400">
                      <div className="animate-pulse mr-2">🔊</div>
                      <span className="text-sm">AI is speaking...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Answer Display */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Your Answer:
              </h3>
              {isRecording && (
                <div className="flex items-center text-red-400 mb-3 animate-pulse">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-ping"></div>
                  Recording...
                </div>
              )}
              <div className="bg-gray-900 rounded p-4 min-h-[100px]">
                {transcript ? (
                  <p className="text-gray-300">{transcript}</p>
                ) : (
                  <p className="text-gray-500 italic">Your answer will appear here...</p>
                )}
              </div>
            </div>

            {/* Evaluation Feedback */}
            {lastEvaluation && (
              <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold">Score: +{lastEvaluation.score} points</p>
                    <p className="text-green-300">{lastEvaluation.feedback}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isAISpeaking}
                className={`px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2 ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors`}
              >
                {isRecording ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                    <span>Start Recording</span>
                  </>
                )}
              </button>

              <button
                onClick={skipQuestion}
                disabled={isAISpeaking || isRecording}
                className="px-6 py-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold text-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                Skip Question
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceInterview;
