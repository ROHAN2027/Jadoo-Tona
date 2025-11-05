import mongoose from 'mongoose';

const TestCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
  },
  expected_output: {
    type: String,
    required: true,
  },
});

const ProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Problem description is required'],
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required'],
    enum: ['Easy', 'Medium', 'Hard'], 
  },
  boilerplate_code: {
    type: Map,
    of: String,
    required: true,
  },
  
  // --- NEW FIELD ADDED HERE ---
  driver_code: {
    type: Map,
    of: String, // e.g., { "python": "s = Solution()...\nprint(result)" }
    required: [true, 'Driver code is required'],
  },

  testcase: {
    type: [TestCaseSchema],
    required: true,
  },
  examples: {
    type: String,
    required: [true, 'Examples are required'], // Added a more specific message
  },
  constraints: {
    type: String,
    required: [true, 'Constraints are required'], // Added a more specific message
  }
}, { timestamps: true }); 

const Problem = mongoose.model('Problem', ProblemSchema);

export default Problem;