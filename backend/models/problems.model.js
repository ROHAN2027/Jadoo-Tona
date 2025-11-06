import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String },
});

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true }, // Should be a JSON string
  expected_output: { type: String, required: true }, // Should be a JSON string
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  examples: [exampleSchema],
  constraints: [String],
  boilerplate_code: {
    type: Map,
    of: String,
    required: true,
  },
  driver_code: {
    type: Map,
    of: String,
    required: true,
  },
  testcase: [testCaseSchema], // For "Run" button (visible examples)
  hidden_testcases: [testCaseSchema], // For "Submit" button
});

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;