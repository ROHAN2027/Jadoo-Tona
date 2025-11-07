import { evaluateConceptualAnswer } from '../services/geminiEvaluator.js';
import dotenv from 'dotenv';

dotenv.config();

// Test question
const testQuestion = {
  category: 'Operating Systems',
  difficulty: 'Medium',
  topic: 'Process Management',
  question: 'What is the difference between a process and a thread?',
  expectedKeyPoints: [
    'Processes have separate memory spaces',
    'Threads share memory within a process',
    'Processes are heavyweight, threads are lightweight',
    'Context switching is faster for threads'
  ]
};

// Test answer
const testAnswer = `A process is an independent program in execution with its own memory space, 
while a thread is a lightweight unit of execution within a process. Multiple threads can exist 
within a single process and share the same memory space. This makes threads more efficient for 
concurrent tasks since they don't need separate memory allocation like processes do.`;

async function testEvaluation() {
  console.log('Testing Gemini Evaluation...\n');
  console.log('Question:', testQuestion.question);
  console.log('\nAnswer:', testAnswer);
  console.log('\n' + '='.repeat(80));
  console.log('Calling Gemini API...\n');
  
  try {
    const result = await evaluateConceptualAnswer(testQuestion, testAnswer);
    
    console.log('\n' + '='.repeat(80));
    console.log('EVALUATION RESULT:');
    console.log('='.repeat(80));
    console.log('Score:', result.score, '/10');
    console.log('Feedback:', result.feedback);
    console.log('\nKey Points Covered:');
    result.keyPointsCovered.forEach((point, idx) => {
      console.log(`  ${idx + 1}. ${point}`);
    });
    console.log('\nMissed Points:');
    result.missedPoints.forEach((point, idx) => {
      console.log(`  ${idx + 1}. ${point}`);
    });
    console.log('='.repeat(80));
    
    // Validate structure
    if (typeof result.score === 'number' && 
        typeof result.feedback === 'string' && 
        Array.isArray(result.keyPointsCovered) && 
        Array.isArray(result.missedPoints)) {
      console.log('\n✅ TEST PASSED: Valid evaluation structure');
    } else {
      console.log('\n❌ TEST FAILED: Invalid evaluation structure');
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED WITH ERROR:');
    console.error(error.message);
    console.error(error.stack);
  }
}

// Run test
testEvaluation();
