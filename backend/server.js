import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './utils/db.js';
import problemRoutes from './routes/problem_route.js';
import { setupVoiceWebSocket } from './websocket/voiceHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/problems', problemRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'An internal server error occurred.',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Create HTTP server and setup WebSocket
const server = createServer(app);
setupVoiceWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}/ws/voice`);
});
