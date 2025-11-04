import mongoose from 'mongoose';
import { stringify } from 'uuid';

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
  testcase:{
    type : [TestCaseSchema],
    required:true,
  },
  
  examples:{
    type: String,
    required: [true]
  },
  constraints:{
    type: String,
    required:[true]
  }

}, { timestamps: true }); 

const Problem = mongoose.model('Problem', ProblemSchema);

export default Problem;