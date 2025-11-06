import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema({
  // User information (for future authentication)
  userId: {
    type: String,
    default: 'anonymous'
  },
  
  // Session metadata
  sessionType: {
    type: String,
    required: true,
    enum: ['dsa', 'conceptual', 'project', 'full']
  },
  
  startedAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: {
    type: Date,
    default: null
  },
  
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  
  // DSA Module
  dsaQuestions: [{
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem'
    },
    problemTitle: String,
    difficulty: String,
    
    submittedCode: {
      type: String,
      default: ''
    },
    
    language: {
      type: String,
      enum: ['python', 'javascript', 'java', 'cpp']
    },
    
    testResults: {
      totalTests: { type: Number, default: 0 },
      passedTests: { type: Number, default: 0 },
      failedTests: [{
        input: String,
        expected: String,
        actual: String
      }],
      executionTime: Number
    },
    
    timeTaken: {
      type: Number, // seconds spent on this problem
      default: 0
    },
    
    isSkipped: {
      type: Boolean,
      default: false
    },
    
    // Scoring
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    
    maxScore: {
      type: Number,
      default: 5
    },
    
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  dsaTotalScore: {
    type: Number,
    default: 0
  },
  
  dsaMaxScore: {
    type: Number,
    default: 0
  },
  
  // Conceptual Module
  conceptualQuestions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConceptualQuestion'
    },
    
    category: String,
    difficulty: String,
    questionText: String,
    
    userAnswer: {
      type: String,
      default: ''
    },
    
    transcript: {
      type: String, // Raw STT output
      default: ''
    },
    
    isSkipped: {
      type: Boolean,
      default: false
    },
    
    // AI Evaluation
    aiEvaluation: {
      score: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
      },
      feedback: {
        type: String,
        default: ''
      },
      keyPointsCovered: [String],
      missedPoints: [String]
    },
    
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  conceptualTotalScore: {
    type: Number,
    default: 0
  },
  
  conceptualMaxScore: {
    type: Number,
    default: 0
  },
  
  // Project Module (Future)
  projectQuestions: [{
    githubRepo: String,
    questionText: String,
    userAnswer: String,
    transcript: String,
    aiEvaluation: {
      score: Number,
      feedback: String
    },
    timestamp: Date
  }],
  
  projectTotalScore: {
    type: Number,
    default: 0
  },
  
  projectMaxScore: {
    type: Number,
    default: 0
  },
  
  // Overall Score
  finalScore: {
    type: Number,
    default: 0
  },
  
  finalMaxScore: {
    type: Number,
    default: 0
  },
  
  // Metadata
  notes: {
    type: String,
    default: ''
  }
});

// Indexes for performance
interviewSessionSchema.index({ userId: 1, createdAt: -1 });
interviewSessionSchema.index({ status: 1 });
interviewSessionSchema.index({ sessionType: 1 });

// Virtual for percentage score
interviewSessionSchema.virtual('percentage').get(function() {
  if (this.finalMaxScore === 0) return 0;
  return Math.round((this.finalScore / this.finalMaxScore) * 100);
});

// Method to calculate final scores
interviewSessionSchema.methods.calculateFinalScore = function() {
  this.finalScore = this.dsaTotalScore + this.conceptualTotalScore + this.projectTotalScore;
  this.finalMaxScore = this.dsaMaxScore + this.conceptualMaxScore + this.projectMaxScore;
  return this.finalScore;
};

// Method to update DSA score
interviewSessionSchema.methods.updateDSAScore = function() {
  this.dsaTotalScore = this.dsaQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
  this.dsaMaxScore = this.dsaQuestions.reduce((sum, q) => sum + (q.maxScore || 5), 0);
  this.calculateFinalScore();
};

// Method to update Conceptual score
interviewSessionSchema.methods.updateConceptualScore = function() {
  this.conceptualTotalScore = this.conceptualQuestions.reduce((sum, q) => sum + (q.aiEvaluation?.score || 0), 0);
  this.conceptualMaxScore = this.conceptualQuestions.length * 10; // 10 points per question
  this.calculateFinalScore();
};

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

export default InterviewSession;
