import { WebSocketServer } from 'ws';
import axios from 'axios';
import crypto from 'crypto';
import FormData from 'form-data';

const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || 'http://localhost:8000';

// Store active interview sessions
const sessions = new Map();

/**
 * Generate a unique session ID
 */
function generateSessionId() {
  return crypto.randomUUID();
}

/**
 * Setup WebSocket server for voice interviews
 * @param {http.Server} server - HTTP server instance
 */
export function setupVoiceWebSocket(server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws/voice'
  });

  console.log('WebSocket server initialized at /ws/voice');

  wss.on('connection', (ws, req) => {
    const sessionId = generateSessionId();
    
    // Initialize session
    sessions.set(sessionId, {
      audioChunks: [],
      state: 'connected',
      questionNumber: 0,
      interviewType: null, // 'conceptual' or 'project'
      conversationHistory: [],
      totalQuestions: 5,
      currentScore: 0
    });

    console.log(`[WebSocket] New connection: ${sessionId}`);

    // Send connection confirmation
    ws.send(JSON.stringify({ 
      type: 'connected', 
      sessionId,
      message: 'Connected to voice interview service'
    }));

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        await handleMessage(ws, sessionId, data);
      } catch (error) {
        console.error(`[WebSocket Error] ${sessionId}:`, error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: error.message || 'An error occurred processing your request'
        }));
      }
    });

    ws.on('close', () => {
      console.log(`[WebSocket] Connection closed: ${sessionId}`);
      sessions.delete(sessionId);
    });

    ws.on('error', (error) => {
      console.error(`[WebSocket Error] ${sessionId}:`, error);
    });
  });

  return wss;
}

/**
 * Handle incoming WebSocket messages
 */
async function handleMessage(ws, sessionId, data) {
  const session = sessions.get(sessionId);
  
  if (!session) {
    ws.send(JSON.stringify({ 
      type: 'error', 
      message: 'Session not found' 
    }));
    return;
  }

  console.log(`[WebSocket] ${sessionId} received: ${data.type}`);

  switch (data.type) {
    case 'start_interview':
      await handleStartInterview(ws, sessionId, data);
      break;

    case 'audio_chunk':
      await handleAudioChunk(ws, sessionId, data);
      break;

    case 'audio_end':
      await handleAudioEnd(ws, sessionId, data);
      break;

    case 'text_answer':
      await handleTextAnswer(ws, sessionId, data);
      break;

    case 'skip_question':
      await handleSkipQuestion(ws, sessionId, data);
      break;

    default:
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: `Unknown message type: ${data.type}` 
      }));
  }
}

/**
 * Handle interview start
 */
async function handleStartInterview(ws, sessionId, data) {
  const session = sessions.get(sessionId);
  session.interviewType = data.interviewType || 'conceptual';
  session.state = 'interview_started';

  console.log(`[Interview] ${sessionId} started: ${session.interviewType}`);

  // TODO: Generate first question based on interview type
  // For now, send a placeholder
  const firstQuestion = session.interviewType === 'conceptual'
    ? "Can you explain the difference between a process and a thread?"
    : "Tell me about the architecture of your most recent project.";

  session.questionNumber = 1;
  session.conversationHistory.push({
    questionNumber: 1,
    question: firstQuestion,
    timestamp: new Date().toISOString()
  });

  // Send question as text first
  ws.send(JSON.stringify({
    type: 'ai_question',
    text: firstQuestion,
    questionNumber: session.questionNumber,
    totalQuestions: session.totalQuestions
  }));

  // Convert to speech and stream audio
  await convertTextToSpeechAndStream(ws, sessionId, firstQuestion);
}

/**
 * Handle audio chunk reception
 */
async function handleAudioChunk(ws, sessionId, data) {
  const session = sessions.get(sessionId);
  session.audioChunks.push(data.data);
  
  // Acknowledge receipt (optional)
  // ws.send(JSON.stringify({ type: 'audio_chunk_received' }));
}

/**
 * Handle end of audio recording
 */
async function handleAudioEnd(ws, sessionId, data) {
  const session = sessions.get(sessionId);
  
  console.log(`[Audio] ${sessionId} processing ${session.audioChunks.length} chunks`);

  try {
    // Combine audio chunks
    const audioBuffers = session.audioChunks.map(chunk => 
      Buffer.from(chunk, 'base64')
    );
    const combinedBuffer = Buffer.concat(audioBuffers);

    // Send to STT service
    const transcription = await speechToText(combinedBuffer, 'audio.webm');

    console.log(`[STT] ${sessionId} transcription: ${transcription.substring(0, 50)}...`);

    // Send transcription to client
    ws.send(JSON.stringify({
      type: 'transcription',
      text: transcription
    }));

    // Clear audio buffer
    session.audioChunks = [];

    // Process the answer
    await processAnswer(ws, sessionId, transcription);

  } catch (error) {
    console.error(`[STT Error] ${sessionId}:`, error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to transcribe audio. Please try again.'
    }));
  }
}

/**
 * Handle text-based answer
 */
async function handleTextAnswer(ws, sessionId, data) {
  console.log(`[Text Answer] ${sessionId}: ${data.text.substring(0, 50)}...`);
  await processAnswer(ws, sessionId, data.text);
}

/**
 * Handle skip question
 */
async function handleSkipQuestion(ws, sessionId, data) {
  const session = sessions.get(sessionId);
  
  // Record skip in history
  const currentQuestion = session.conversationHistory[session.conversationHistory.length - 1];
  if (currentQuestion) {
    currentQuestion.answer = "[SKIPPED]";
    currentQuestion.skipped = true;
  }

  // Move to next question
  await moveToNextQuestion(ws, sessionId);
}

/**
 * Process answer and generate next question
 */
async function processAnswer(ws, sessionId, answerText) {
  const session = sessions.get(sessionId);
  
  // Store answer in conversation history
  const currentQuestion = session.conversationHistory[session.conversationHistory.length - 1];
  if (currentQuestion) {
    currentQuestion.answer = answerText;
    currentQuestion.answeredAt = new Date().toISOString();
  }

  // TODO: Send to Gemini AI for evaluation
  // For now, use placeholder evaluation
  const evaluation = {
    score: Math.floor(Math.random() * 5) + 5, // Random score 5-10
    feedback: "Good answer. Let's move to the next question."
  };

  session.currentScore += evaluation.score;

  // Send evaluation
  ws.send(JSON.stringify({
    type: 'evaluation',
    score: evaluation.score,
    feedback: evaluation.feedback,
    currentScore: session.currentScore
  }));

  // Wait a moment, then move to next question
  setTimeout(() => {
    moveToNextQuestion(ws, sessionId);
  }, 2000);
}

/**
 * Move to next question or end interview
 */
async function moveToNextQuestion(ws, sessionId) {
  const session = sessions.get(sessionId);
  
  if (session.questionNumber >= session.totalQuestions) {
    // Interview complete
    ws.send(JSON.stringify({
      type: 'interview_complete',
      totalScore: session.currentScore,
      maxScore: session.totalQuestions * 10,
      questionsAnswered: session.conversationHistory.length
    }));
    return;
  }

  // Generate next question
  session.questionNumber++;
  
  // TODO: Use AI to generate contextual follow-up questions
  // For now, use placeholders
  const nextQuestion = session.interviewType === 'conceptual'
    ? `Question ${session.questionNumber}: Can you explain what a deadlock is?`
    : `Question ${session.questionNumber}: How did you handle error scenarios in your project?`;

  session.conversationHistory.push({
    questionNumber: session.questionNumber,
    question: nextQuestion,
    timestamp: new Date().toISOString()
  });

  // Send question
  ws.send(JSON.stringify({
    type: 'ai_question',
    text: nextQuestion,
    questionNumber: session.questionNumber,
    totalQuestions: session.totalQuestions
  }));

  // Convert to speech
  await convertTextToSpeechAndStream(ws, sessionId, nextQuestion);
}

/**
 * Convert text to speech using Voice Service
 * Buffers initial audio chunks for smoother playback
 */
async function convertTextToSpeechAndStream(ws, sessionId, text) {
  try {
    const response = await axios.post(
      `${VOICE_SERVICE_URL}/voice/tts`,
      { text },
      { 
        responseType: 'stream',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    // Buffer initial chunks for smoother playback (prevents choppy audio)
    const audioBuffer = [];
    const BUFFER_SIZE = 50; // Buffer first 25 chunks (~2-3 seconds) before streaming
    let chunkCount = 0;
    let isBuffering = true;

    response.data.on('data', (chunk) => {
      if (isBuffering) {
        audioBuffer.push(chunk);
        chunkCount++;
        
        // Once we have enough buffered, send start signal and flush buffer
        if (chunkCount >= BUFFER_SIZE) {
          isBuffering = false;
          ws.send(JSON.stringify({ type: 'audio_stream_start' }));
          
          // Send all buffered chunks
          audioBuffer.forEach(bufferedChunk => {
            ws.send(JSON.stringify({
              type: 'audio_chunk',
              data: bufferedChunk.toString('base64')
            }));
          });
          audioBuffer.length = 0; // Clear buffer
        }
      } else {
        // Normal streaming after buffer is flushed
        ws.send(JSON.stringify({
          type: 'audio_chunk',
          data: chunk.toString('base64')
        }));
      }
    });

    response.data.on('end', () => {
      // If audio was very short and never left buffering mode, send now
      if (isBuffering && audioBuffer.length > 0) {
        ws.send(JSON.stringify({ type: 'audio_stream_start' }));
        audioBuffer.forEach(bufferedChunk => {
          ws.send(JSON.stringify({
            type: 'audio_chunk',
            data: bufferedChunk.toString('base64')
          }));
        });
      }
      
      ws.send(JSON.stringify({ type: 'audio_stream_end' }));
      console.log(`[TTS] ${sessionId} audio streaming complete (buffered ${chunkCount} total chunks)`);
    });

    response.data.on('error', (error) => {
      console.error(`[TTS Error] ${sessionId}:`, error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to generate speech audio'
      }));
    });

  } catch (error) {
    console.error(`[TTS Error] ${sessionId}:`, error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Text-to-speech service unavailable'
    }));
  }
}

/**
 * Send audio to STT service
 */
async function speechToText(audioBuffer, filename) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBuffer, {
      filename: filename,
      contentType: 'audio/webm'
    });

    const response = await axios.post(
      `${VOICE_SERVICE_URL}/voice/stt`,
      formData,
      {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    return response.data.text;
  } catch (error) {
    console.error('[STT Service Error]:', error.response?.data || error.message);
    throw new Error('Speech-to-text conversion failed');
  }
}
