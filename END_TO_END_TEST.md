# 🎤 Voice Interview - End-to-End Testing

## ✅ System Status

All services are **RUNNING**:
- ✅ Voice Service (FastAPI): http://localhost:8000
- ✅ Backend (WebSocket): http://localhost:5000 (WS: ws://localhost:5000/ws/voice)
- ✅ Client (React): http://localhost:3000

## 🧪 Test Steps

### 1. Open the Application
Navigate to: **http://localhost:3000**

You should see the Voice Interview interface with:
- Green "● Connected" badge (top right)
- "Conceptual Interview" title
- "Start Interview" button

### 2. Start the Interview
**Action**: Click the **"Start Interview"** button

**Expected Behavior**:
- ✅ Button disappears
- ✅ Progress bar appears showing "Question 1 of 5"
- ✅ First question displays in text
- ✅ AI speaks the question (audio should play automatically)
- ✅ "🔊 AI is speaking..." indicator shows

**What's Happening Behind the Scenes**:
```
Frontend → WebSocket → Backend (start_interview)
Backend → Generate question
Backend → Voice Service (/voice/tts)
Voice Service → ElevenLabs API
Audio streams back → Frontend plays
```

### 3. Record Your Answer
**Action**: 
1. Wait for AI to finish speaking
2. Click **"Start Recording"** button
3. **Allow microphone access** when browser prompts
4. Speak your answer (e.g., "A process is an independent execution unit...")
5. Click **"Stop Recording"**

**Expected Behavior**:
- ✅ Recording indicator (red pulsing dot) appears
- ✅ "Recording..." text shows
- ✅ After stopping, "Your Answer" section updates with transcribed text
- ✅ Green evaluation panel appears showing score and feedback
- ✅ After ~2 seconds, next question loads automatically

**What's Happening**:
```
Microphone → MediaRecorder → Audio chunks (base64)
Frontend → WebSocket (audio_chunk messages)
Backend → Buffers chunks
Backend → Voice Service (/voice/stt)
Voice Service → Groq Whisper API
Transcription → Backend → Frontend (displays)
Backend → Evaluates answer (currently mock)
Backend → Generates next question
Cycle repeats...
```

### 4. Skip a Question (Optional)
**Action**: Click **"Skip Question"** button

**Expected Behavior**:
- ✅ Current answer shows "[Skipped]"
- ✅ Next question loads immediately
- ✅ Progress bar updates

### 5. Complete the Interview
**Action**: Complete all 5 questions

**Expected Behavior**:
- ✅ After question 5, interview ends
- ✅ Alert popup shows:
  - Total score
  - Max score
  - Questions answered
- ✅ Console shows completion data

## 🔍 Debugging Checklist

### If WebSocket Won't Connect
**Check Backend Terminal**:
```bash
# Should see:
WebSocket server initialized at /ws/voice
[WebSocket] New connection: [uuid]
```

**Check Browser Console** (F12 → Console):
```
WebSocket connected
Received: connected
```

### If No Audio Plays
**Check Voice Service Terminal**:
```bash
# Should see HTTP requests:
INFO: 127.0.0.1:xxxxx - "POST /voice/tts HTTP/1.1" 200 OK
```

**Browser Console**:
```
Received: audio_stream_start
Received: audio_chunk (multiple times)
Received: audio_stream_end
```

**Common Issues**:
- ❌ ElevenLabs API key invalid → Check GithubFeature/.env
- ❌ Browser audio blocked → Click speaker icon in address bar
- ❌ No speakers/volume muted → Check system audio

### If Recording Doesn't Work
**Browser Console**:
```
Error starting recording: ...
```

**Common Issues**:
- ❌ Microphone permission denied → Allow in browser settings
- ❌ No microphone detected → Check system settings
- ❌ HTTPS required (some browsers) → Use http://localhost (should work)

### If Transcription Fails
**Backend Terminal**:
```bash
[STT Error] [sessionId]: ...
```

**Check**:
- ❌ Groq API key invalid → Check GithubFeature/.env
- ❌ Audio format unsupported → Check browser's MediaRecorder format

## 📊 Monitor in Real-Time

### Terminal 1: Voice Service (FastAPI)
Watch for:
```
INFO: 127.0.0.1:xxxxx - "POST /voice/tts HTTP/1.1" 200 OK
INFO: 127.0.0.1:xxxxx - "POST /voice/stt HTTP/1.1" 200 OK
```

### Terminal 2: Backend (Node.js)
Watch for:
```
[WebSocket] New connection: [uuid]
[WebSocket] [uuid] received: start_interview
[Interview] [uuid] started: conceptual
[Audio] [uuid] processing X chunks
[STT] [uuid] transcription: ...
[TTS] [uuid] audio streaming complete
```

### Terminal 3: Browser Console (F12)
Watch for:
```
WebSocket connected
Received: connected
Received: ai_question
Received: audio_stream_start
Received: audio_chunk (many)
Received: audio_stream_end
Received: transcription
Received: evaluation
```

## ✅ Success Criteria

### Minimum Viable Test
- [ ] WebSocket connects (green badge)
- [ ] Interview starts
- [ ] AI speaks question (audio plays)
- [ ] Can record audio (microphone works)
- [ ] Transcription appears
- [ ] Next question loads

### Full Flow Test
- [ ] Complete all 5 questions
- [ ] Audio playback is smooth
- [ ] Transcriptions are accurate
- [ ] Progress bar updates correctly
- [ ] Final score appears
- [ ] No errors in any terminal

## 🐛 Known Issues

1. **First audio chunk delay**: 2-3 seconds latency for TTS (ElevenLabs API)
2. **Pydantic warning**: Harmless Python 3.14 compatibility warning
3. **Questions are placeholders**: Real AI integration (Gemini) not yet implemented
4. **Scores are random**: Evaluation logic needs Gemini integration

## 🎯 Next Steps After Testing

If basic flow works:
1. ✅ Mark "Test basic audio flow" as complete
2. 🔄 Integrate Gemini AI for:
   - Real question generation
   - Answer evaluation
3. 🔄 Add conversation context
4. 🔄 Implement project interview mode
5. 🔄 Add database persistence

## 📝 Testing Notes

Record your observations:
- **WebSocket Connection**: ____________
- **AI Audio Quality**: ____________
- **Recording Works**: ____________
- **Transcription Accuracy**: ____________
- **Interview Flow**: ____________
- **Any Errors**: ____________

---

**Ready to test!** Navigate to http://localhost:3000 and follow the steps above. 🚀
