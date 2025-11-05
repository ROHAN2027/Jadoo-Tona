import express from 'express';
import { handleSubmit } from '../controllers/submissionController.js';
import { getProblem } from '../controllers/problemController.js';
import { createProblem } from '../controllers/problemController.js';

const router = express.Router();

// GET /api/problems/:title
router.get('/:title', getProblem);

// POST /api/problems/submit/:title
router.post('/submit/:title', handleSubmit);

// POST /api/problems
router.post('/', createProblem);

export default router;
