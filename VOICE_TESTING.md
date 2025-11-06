# Voice Interview Feature - Testing Guide

## 🚀 Quick Start

### 1. Start GithubFeature Service (Voice Service)
```bash
cd GithubFeature
source venv/bin/activate  # Activate virtual environment
uvicorn main:app --reload --port 8000
```

**Required Environment Variables** (create `.env` file):
```bash
ELEVENLABS_API_KEY=your_key_here
ELEVENLABS_VOICE_ID=your_voice_id
GROQ_API_KEY=your_groq_key_here
```

### 2. Start Backend (WebSocket Server)
```bash
cd backend
npm run dev  # Starts on port 5000
```

**Required Environment Variables** (create `.env` file):
```bash
MONGO_URL=mongodb://localhost:27017/jadutona
JUDGE0_API_KEY=your_judge0_key
VOICE_SERVICE_URL=http://localhost:8000
```

### 3. Start Client (React Frontend)
```bash
cd client
npm run dev  # Starts on port 3000
```

### 4. Access Voice Interview
- Navigate to: `http://localhost:3000`
- Change the App.jsx to render VoiceInterviewPage for testing

## 📋 Testing Checklist

### Basic Connectivity
- [ ] GithubFeature service starts without errors
- [ ] Backend WebSocket initializes successfully
- [ ] Client connects to WebSocket (check browser console)
- [ ] "Connected" badge shows green

### Interview Flow
- [ ] Click "Start Interview" button
- [ ] AI asks first question (text appears)
- [ ] AI speaks question (audio plays)
- [ ] Click "Start Recording" (microphone permission granted)
- [ ] Speak an answer
- [ ] Click "Stop Recording"
- [ ] Transcription appears in "Your Answer" section
- [ ] Evaluation feedback shows
- [ ] Next question appears after 2 seconds
- [ ] Progress bar updates correctly

### Audio Features
- [ ] AI speech is clear and plays smoothly
- [ ] Recording indicator animates (red dot)
- [ ] Microphone captures voice correctly
- [ ] Transcription is accurate

### Edge Cases
- [ ] Skip question works
- [ ] Interview completes after 5 questions
- [ ] Error messages display correctly
- [ ] Reconnection after disconnect

## 🐛 Troubleshooting

### WebSocket won't connect
- Check backend is running on port 5000
- Verify WebSocket URL: `ws://localhost:5000/ws/voice`
- Check browser console for errors

### No audio playback
- Check ElevenLabs API key is set
- Verify voice service is running
- Check browser audio permissions

### Transcription fails
- Verify Groq API key is set
- Check microphone permissions in browser
- Ensure audio format is webm (check browser support)

### "Connection error"
- Ensure all three services are running
- Check .env files have correct values
- Verify ports aren't already in use

## 🔧 Development Tips

### Enable Detailed Logging
- Backend: Check WebSocket console logs
- Frontend: Open browser DevTools → Console
- Voice Service: Check uvicorn terminal output

### Test Without Voice
The system supports text-based answers too:
- Modify `VoiceInterview.jsx` to add a text input
- Send message: `{ type: 'text_answer', text: 'your answer' }`

### Mock Services
For testing without API keys:
- Modify `voiceHandler.js` to return mock responses
- Comment out TTS/STT calls temporarily

## 📝 Known Limitations

1. **Audio Format**: Currently supports webm - may not work on all browsers
2. **Latency**: 2-3 seconds delay for STT processing
3. **Questions**: Currently using placeholder questions (AI integration pending)
4. **Evaluation**: Using random scores (Gemini integration pending)

## 🎯 Next Steps

- [ ] Integrate Gemini AI for question generation
- [ ] Implement real evaluation logic
- [ ] Add context-aware follow-up questions
- [ ] Support multiple interview types (conceptual vs project)
- [ ] Add interview history/results page
- [ ] Optimize audio streaming for lower latency
- [ ] Add text input option for answers
- [ ] Implement session persistence

## 📞 Support

If you encounter issues:
1. Check all services are running
2. Verify .env files are configured
3. Review console logs for errors
4. Check API key validity
