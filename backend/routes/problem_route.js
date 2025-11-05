import express from 'express';
import { handleSubmit } from '../controllers/submissionController.js';
import { getProblem, getRandomQuestions } from '../controllers/problemController.js';
import { createProblem } from '../controllers/problemController.js';

const router = express.Router();

// GET /api/problems/random/questions?count=5
router.get('/random/questions', getRandomQuestions);

// GET /api/problems/:title
router.get('/:title', getProblem);

// POST /api/problems/submit/:title
router.post('/submit/:title', handleSubmit);

// POST /api/problems
router.post('/', createProblem);

export default router;
