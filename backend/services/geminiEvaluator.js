import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.0,
    maxOutputTokens: 1000,
    responseMimeType: 'application/json',
  }
});

/**
 * Helper function to retry with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

/**
 * Helper function to parse JSON from Gemini response with multiple strategies
 */
function parseGeminiJSON(text) {
  // Strategy 1: Direct JSON parse (works if response is pure JSON)
  try {
    return JSON.parse(text);
  } catch (e) {
    // Continue to next strategy
  }

  // Strategy 2: Remove markdown code blocks
  try {
    const withoutCodeBlock = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    return JSON.parse(withoutCodeBlock);
  } catch (e) {
    // Continue to next strategy
  }

  // Strategy 3: Extract JSON object using regex
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // Continue to next strategy
  }

  // Strategy 4: Find first { and last }
  try {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonStr = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonStr);
    }
  } catch (e) {
    // Continue to next strategy
  }

  // Strategy 5: Clean up common issues and try again
  try {
    let cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/\n/g, ' ')
      .replace(/\r/g, '')
      .trim();
    
    // Find JSON boundaries
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      cleaned = cleaned.substring(start, end + 1);
      return JSON.parse(cleaned);
    }
  } catch (e) {
    // All strategies failed
  }

  return null;
}

/**
 * Evaluate conceptual answer using Gemini AI
 * @param {Object} question - Question object with expectedKeyPoints
 * @param {String} userAnswer - User's answer text
 * @returns {Object} - Evaluation with score, feedback, covered and missed points
 */
export async function evaluateConceptualAnswer(question, userAnswer) {
  try {
    if (!userAnswer || userAnswer.trim() === '') {
      return {
        score: 0,
        feedback: 'No answer provided.',
        keyPointsCovered: [],
        missedPoints: question.expectedKeyPoints || []
      };
    }

    const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

**Question Category:** ${question.category}
**Difficulty:** ${question.difficulty}
**Topic:** ${question.topic}

**Question:**
${question.question}

**Expected Key Points:**
${question.expectedKeyPoints?.map((point, idx) => `${idx + 1}. ${point}`).join('\n') || 'N/A'}

**Candidate's Answer:**
${userAnswer}

**Evaluation Task:**
1. Score the answer from 0-10 based on:
   - Accuracy and correctness (40%)
   - Completeness (how many key points covered) (30%)
   - Clarity and communication (20%)
   - Technical depth appropriate to difficulty (10%)

2. Provide constructive feedback (2-3 sentences)

3. List which key points were covered

4. List which important points were missed

**CRITICAL: You must respond with ONLY a valid JSON object. No markdown, no code blocks, no additional text.**

Response format:
{
  "score": <number between 0 and 10>,
  "feedback": "<constructive feedback string>",
  "keyPointsCovered": ["<point1>", "<point2>"],
  "missedPoints": ["<missed1>", "<missed2>"]
}`;

    // Use retry with backoff for rate limit handling
    const result = await retryWithBackoff(async () => {
      return await model.generateContent(prompt);
    });
    
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw Gemini response:', text); // Debug logging
    
    // Parse JSON response with multiple strategies
    const evaluation = parseGeminiJSON(text);
    
    if (!evaluation) {
      console.error('Failed to parse Gemini response after all strategies:', text);
      return {
        score: 5,
        feedback: 'Unable to evaluate answer properly due to parsing error. Your answer has been recorded.',
        keyPointsCovered: [],
        missedPoints: question.expectedKeyPoints || []
      };
    }

    // Validate and sanitize the response
    const sanitizedEvaluation = {
      score: typeof evaluation.score === 'number' ? Math.max(0, Math.min(10, evaluation.score)) : 5,
      feedback: typeof evaluation.feedback === 'string' ? evaluation.feedback : 'Evaluation completed.',
      keyPointsCovered: Array.isArray(evaluation.keyPointsCovered) ? evaluation.keyPointsCovered : [],
      missedPoints: Array.isArray(evaluation.missedPoints) ? evaluation.missedPoints : (question.expectedKeyPoints || [])
    };
    
    return sanitizedEvaluation;
  } catch (error) {
    console.error('Error evaluating with Gemini:', error.message || error);
    
    // Fallback evaluation
    return {
      score: 5,
      feedback: 'Evaluation service temporarily unavailable. Your answer has been recorded.',
      keyPointsCovered: [],
      missedPoints: question.expectedKeyPoints || []
    };
  }
}

/**
 * Get a hint or explanation for a skipped question
 * @param {Object} question - Question object
 * @returns {String} - Explanation/hint
 */
export async function getQuestionExplanation(question) {
  try {
    const prompt = `Provide a clear, concise explanation for this technical interview question:

**Question:** ${question.question}
**Category:** ${question.category}
**Difficulty:** ${question.difficulty}

Explain the concept in 3-4 sentences that would help a candidate understand the answer.
Keep it educational and encouraging.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting explanation from Gemini:', error);
    return question.sampleAnswer || 'Explanation unavailable at this time.';
  }
}

/**
 * Generate follow-up question based on answer quality
 * @param {Object} question - Original question
 * @param {String} userAnswer - User's answer
 * @param {Number} score - Score from evaluation
 * @returns {String|null} - Follow-up question or null
 */
export async function generateFollowUpQuestion(question, userAnswer, score) {
  try {
    // Only generate follow-ups for medium to good answers
    if (score < 5 || score > 8) {
      return null;
    }

    const prompt = `Based on the candidate's answer to this question, generate a relevant follow-up question:

**Original Question:** ${question.question}
**Candidate's Answer:** ${userAnswer}
**Score:** ${score}/10

Generate a follow-up question that:
- Probes deeper into the same topic
- Is appropriate for ${question.difficulty} level
- Takes 30-60 seconds to answer

Return only the question text, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating follow-up question:', error);
    return null;
  }
}

export default {
  evaluateConceptualAnswer,
  getQuestionExplanation,
  generateFollowUpQuestion
};
