import express from 'express';
import {
  getRandomQuestions,
  getQuestionById,
  getCategories,
  getStatistics
} from '../controllers/conceptualQuestionController.js';

const router = express.Router();

// Get random questions
router.get('/random', getRandomQuestions);

// Get all categories
router.get('/categories', getCategories);

// Get statistics
router.get('/statistics', getStatistics);

// Get question by ID
router.get('/:id', getQuestionById);

export default router;
