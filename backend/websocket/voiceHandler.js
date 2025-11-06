import { WebSocketServer } from 'ws';
import axios from 'axios';
import crypto from 'crypto';
import FormData from 'form-data';
import InterviewSession from '../models/interviewSession.model.js';
import ConceptualQuestion from '../models/conceptualQuestion.model.js';
import { evaluateConceptualAnswer } from '../services/geminiEvaluator.js';

const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || 'http://localhost:8000';

// Store active WebSocket sessions (for audio buffering, different from DB sessions)
const wsSessions = new Map();

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
    const wsSessionId = generateSessionId();
    
    // Initialize WebSocket session (for audio buffering)
    wsSessions.set(wsSessionId, {
      audioChunks: [],
      dbSessionId: null, // Will be set when interview starts
      currentQuestionIndex: 0
    });

    console.log(`[WebSocket] New connection: ${wsSessionId}`);

    // Send connection confirmation
    ws.send(JSON.stringify({ 
      type: 'connected', 
      sessionId: wsSessionId,
      message: 'Connected to voice interview service'
    }));

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        await handleMessage(ws, wsSessionId, data);
      } catch (error) {
        console.error(`[WebSocket Error] ${wsSessionId}:`, error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: error.message || 'An error occurred processing your request'
        }));
      }
    });

    ws.on('close', () => {
      console.log(`[WebSocket] Connection closed: ${wsSessionId}`);
      wsSessions.delete(wsSessionId);
    });

    ws.on('error', (error) => {
      console.error(`[WebSocket Error] ${wsSessionId}:`, error);
    });
  });

  return wss;
}

/**
 * Handle incoming WebSocket messages
 */
async function handleMessage(ws, wsSessionId, data) {
  const wsSession = wsSessions.get(wsSessionId);
  
  if (!wsSession) {
    ws.send(JSON.stringify({ 
      type: 'error', 
      message: 'Session not found' 
    }));
    return;
  }

  console.log(`[WebSocket] ${wsSessionId} received: ${data.type}`);

  switch (data.type) {
    case 'start_interview':
      await handleStartInterview(ws, wsSessionId, data);
      break;

    case 'audio_chunk':
      await handleAudioChunk(ws, wsSessionId, data);
      break;

    case 'audio_end':
      await handleAudioEnd(ws, wsSessionId, data);
      break;

    case 'text_answer':
      await handleTextAnswer(ws, wsSessionId, data);
      break;

    case 'skip_question':
      await handleSkipQuestion(ws, wsSessionId, data);
      break;

    default:
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: `Unknown message type: ${data.type}` 
      }));
  }
}

/**
 * Handle interview start - Create DB session and fetch questions
 */
async function handleStartInterview(ws, wsSessionId, data) {
  const wsSession = wsSessions.get(wsSessionId);
  const interviewType = data.interviewType || 'conceptual';
  const questionCount = data.questionCount || 5;

  console.log(`[Interview] ${wsSessionId} starting: ${interviewType}`);

  try {
    // Create interview session in database
    const dbSession = new InterviewSession({
      sessionType: interviewType,
      userId: data.userId || 'anonymous',
      status: 'in_progress'
    });

    // Fetch random questions weighted by difficulty
    const easyCount = Math.floor(questionCount * 0.4);
    const mediumCount = Math.floor(questionCount * 0.4);
    const hardCount = questionCount - easyCount - mediumCount;

    const easyQuestions = await ConceptualQuestion.aggregate([
      { $match: { difficulty: 'Easy' } },
      { $sample: { size: easyCount } }
    ]);

    const mediumQuestions = await ConceptualQuestion.aggregate([
      { $match: { difficulty: 'Medium' } },
      { $sample: { size: mediumCount } }
    ]);

    const hardQuestions = await ConceptualQuestion.aggregate([
      { $match: { difficulty: 'Hard' } },
      { $sample: { size: hardCount } }
    ]);

    const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);

    // Initialize conceptual questions in session
    dbSession.conceptualQuestions = shuffled.map(q => ({
      questionId: q._id,
      category: q.category,
      difficulty: q.difficulty,
      questionText: q.question
    }));

    dbSession.conceptualMaxScore = shuffled.length * 10;
    await dbSession.save();

    // Store DB session ID in WebSocket session
    wsSession.dbSessionId = dbSession._id.toString();
    wsSession.questions = shuffled; // Store full questions for evaluation

    console.log(`[Interview] ${wsSessionId} DB session created: ${dbSession._id}`);

    // Send first question
    const firstQuestion = shuffled[0];
    ws.send(JSON.stringify({
      type: 'ai_question',
      text: firstQuestion.question,
      questionNumber: 1,
      totalQuestions: shuffled.length,
      category: firstQuestion.category,
      difficulty: firstQuestion.difficulty
    }));

    // Convert to speech and stream audio
    await convertTextToSpeechAndStream(ws, wsSessionId, firstQuestion.question);

  } catch (error) {
    console.error(`[Interview Start Error] ${wsSessionId}:`, error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to start interview. Please try again.'
    }));
  }
}

/**
 * Handle audio chunk reception
 */
async function handleAudioChunk(ws, wsSessionId, data) {
  const wsSession = wsSessions.get(wsSessionId);
  wsSession.audioChunks.push(data.data);
}

/**
 * Handle end of audio recording - Process with Gemini
 */
async function handleAudioEnd(ws, wsSessionId, data) {
  const wsSession = wsSessions.get(wsSessionId);
  
  console.log(`[Audio] ${wsSessionId} processing ${wsSession.audioChunks.length} chunks`);

  try {
    // Combine audio chunks
    const audioBuffers = wsSession.audioChunks.map(chunk => 
      Buffer.from(chunk, 'base64')
    );
    const combinedBuffer = Buffer.concat(audioBuffers);

    // Send to STT service
    const transcription = await speechToText(combinedBuffer, 'audio.webm');

    console.log(`[STT] ${wsSessionId} transcription: ${transcription.substring(0, 50)}...`);

    // Send transcription to client
    ws.send(JSON.stringify({
      type: 'transcription',
      text: transcription
    }));

    // Clear audio buffer
    wsSession.audioChunks = [];

    // Process the answer
    await processAnswer(ws, wsSessionId, transcription, false);

  } catch (error) {
    console.error(`[STT Error] ${wsSessionId}:`, error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to transcribe audio. Please try again.'
    }));
  }
}

/**
 * Handle text-based answer
 */
async function handleTextAnswer(ws, wsSessionId, data) {
  console.log(`[Text Answer] ${wsSessionId}: ${data.text.substring(0, 50)}...`);
  await processAnswer(ws, wsSessionId, data.text, false);
}

/**
 * Handle skip question
 */
async function handleSkipQuestion(ws, wsSessionId, data) {
  await processAnswer(ws, wsSessionId, '[SKIPPED]', true);
}

/**
 * Process answer with Gemini AI evaluation and save to DB
 */
async function processAnswer(ws, wsSessionId, answerText, isSkipped) {
  const wsSession = wsSessions.get(wsSessionId);
  
  try {
    // Get DB session
    const dbSession = await InterviewSession.findById(wsSession.dbSessionId);
    if (!dbSession) {
      throw new Error('Database session not found');
    }

    const currentIndex = wsSession.currentQuestionIndex;
    const currentQuestion = wsSession.questions[currentIndex];
    const sessionQuestion = dbSession.conceptualQuestions[currentIndex];

    if (!currentQuestion || !sessionQuestion) {
      throw new Error('Question not found');
    }

    let evaluation;
    
    if (isSkipped) {
      evaluation = {
        score: 0,
        feedback: 'Question was skipped.',
        keyPointsCovered: [],
        missedPoints: currentQuestion.expectedKeyPoints || []
      };
    } else {
      // Evaluate with Gemini AI
      evaluation = await evaluateConceptualAnswer(currentQuestion, answerText);
    }

    // Update session question in database
    sessionQuestion.userAnswer = answerText;
    sessionQuestion.transcript = answerText;
    sessionQuestion.isSkipped = isSkipped;
    sessionQuestion.aiEvaluation = evaluation;
    sessionQuestion.timestamp = new Date();

    // Update scores
    dbSession.updateConceptualScore();
    await dbSession.save();

    console.log(`[Evaluation] ${wsSessionId} Score: ${evaluation.score}/10`);

    // Send evaluation to client
    ws.send(JSON.stringify({
      type: 'evaluation',
      score: evaluation.score,
      feedback: evaluation.feedback,
      keyPointsCovered: evaluation.keyPointsCovered,
      missedPoints: evaluation.missedPoints,
      currentScore: dbSession.conceptualTotalScore
    }));

    // Wait a moment, then move to next question
    setTimeout(() => {
      moveToNextQuestion(ws, wsSessionId, dbSession);
    }, 3000); // 3 second delay to show feedback

  } catch (error) {
    console.error(`[Process Answer Error] ${wsSessionId}:`, error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process answer. Moving to next question.'
    }));
    
    // Try to move to next question anyway
    setTimeout(() => {
      const dbSession = InterviewSession.findById(wsSession.dbSessionId);
      moveToNextQuestion(ws, wsSessionId, dbSession);
    }, 2000);
  }
}

/**
 * Move to next question or complete interview
 */
async function moveToNextQuestion(ws, wsSessionId, dbSession) {
  const wsSession = wsSessions.get(wsSessionId);
  
  // Check if WebSocket session still exists (connection might be closed)
  if (!wsSession) {
    console.log(`[Question Skip] ${wsSessionId} WebSocket session not found (connection likely closed)`);
    return;
  }
  
  wsSession.currentQuestionIndex++;
  const nextIndex = wsSession.currentQuestionIndex;
  const totalQuestions = wsSession.questions.length;

  if (nextIndex >= totalQuestions) {
    // Interview complete - finalize DB session
    dbSession.status = 'completed';
    dbSession.completedAt = new Date();
    dbSession.calculateFinalScore();
    await dbSession.save();

    ws.send(JSON.stringify({
      type: 'interview_complete',
      sessionId: dbSession._id,
      totalScore: dbSession.conceptualTotalScore,
      maxScore: dbSession.conceptualMaxScore,
      questionsAnswered: totalQuestions,
      percentage: dbSession.percentage
    }));
    
    console.log(`[Interview Complete] ${wsSessionId} Score: ${dbSession.conceptualTotalScore}/${dbSession.conceptualMaxScore}`);
    return;
  }

  // Send next question
  const nextQuestion = wsSession.questions[nextIndex];
  
  ws.send(JSON.stringify({
    type: 'ai_question',
    text: nextQuestion.question,
    questionNumber: nextIndex + 1,
    totalQuestions: totalQuestions,
    category: nextQuestion.category,
    difficulty: nextQuestion.difficulty
  }));

  // Convert to speech
  await convertTextToSpeechAndStream(ws, wsSessionId, nextQuestion.question);
}

/**
 * Convert text to speech using Voice Service
 * Buffers initial audio chunks for smoother playback
 */
async function convertTextToSpeechAndStream(ws, wsSessionId, text) {
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
    const BUFFER_SIZE = 50; // Buffer first 50 chunks (~2-3 seconds) before streaming
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
      console.log(`[TTS] ${wsSessionId} audio streaming complete (buffered ${chunkCount} total chunks)`);
    });

    response.data.on('error', (error) => {
      console.error(`[TTS Error] ${wsSessionId}:`, error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to generate speech audio'
      }));
    });

  } catch (error) {
    console.error(`[TTS Error] ${wsSessionId}:`, error);
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
