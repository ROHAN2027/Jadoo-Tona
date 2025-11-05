import express from 'express';
import { handleSubmit } from '../controllers/submissionController.js';
import { getProblem } from '../controllers/problemController.js';
import { createProblem } from '../controllers/problemController.js';
const router = express.Router();

router.get('/problems/:title', getProblem);

router.post('/submit/:title', handleSubmit);
router.post('/problems', createProblem);
export default router;

