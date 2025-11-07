import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  sessionId: {
    type: String, // Changed to String for temporary UUID/default value
    required: true,
    default: 'default-session', // Default session for now
    index: true
  },
  problemTitle: {
    type: String,
    required: true,
    index: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['python', 'javascript', 'java', 'cpp']
  },
  result: {
    type: String,
    required: true,
    enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Compilation Error', 'Time Limit Exceeded']
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  executionTime: {
    type: Number, // in milliseconds
    default: 0
  },
  memoryUsed: {
    type: Number, // in KB
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one submission per problem per session
submissionSchema.index({ sessionId: 1, problemTitle: 1 }, { unique: true });

// Static method to save or update submission (keeps best one)
submissionSchema.statics.saveOrUpdateBest = async function(submissionData) {
  const { sessionId, problemTitle } = submissionData;
  
  // Find existing submission for this problem in this session
  const existingSubmission = await this.findOne({ sessionId, problemTitle });
  
  if (!existingSubmission) {
    // No existing submission, create new one
    return await this.create(submissionData);
  }
  
  // Compare with existing submission
  const isNewBetter = 
    submissionData.testCasesPassed > existingSubmission.testCasesPassed ||
    (submissionData.testCasesPassed === existingSubmission.testCasesPassed && 
     submissionData.result === 'Accepted' && existingSubmission.result !== 'Accepted');
  
  if (isNewBetter) {
    // Update with better submission
    return await this.findOneAndUpdate(
      { sessionId, problemTitle },
      submissionData,
      { new: true, runValidators: true }
    );
  }
  
  // Keep existing, but update the code (last attempt)
  return await this.findOneAndUpdate(
    { sessionId, problemTitle },
    { 
      code: submissionData.code,
      language: submissionData.language,
      submittedAt: submissionData.submittedAt
    },
    { new: true }
  );
};

// Static method to save last submission (always update)
submissionSchema.statics.saveLastSubmission = async function(submissionData) {
  const { sessionId, problemTitle } = submissionData;
  
  return await this.findOneAndUpdate(
    { sessionId, problemTitle },
    submissionData,
    { 
      new: true, 
      upsert: true, // Create if doesn't exist
      runValidators: true 
    }
  );
};

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
