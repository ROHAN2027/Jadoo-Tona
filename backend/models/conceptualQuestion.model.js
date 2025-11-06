import mongoose from 'mongoose';

const conceptualQuestionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Operating Systems', 'Networks', 'DBMS', 'System Design', 'Data Structures', 'Algorithms', 'OOP', 'General CS']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  expectedKeyPoints: {
    type: [String],
    default: []
  },
  sampleAnswer: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
conceptualQuestionSchema.index({ category: 1, difficulty: 1 });
conceptualQuestionSchema.index({ topic: 1 });

const ConceptualQuestion = mongoose.model('ConceptualQuestion', conceptualQuestionSchema);

export default ConceptualQuestion;
