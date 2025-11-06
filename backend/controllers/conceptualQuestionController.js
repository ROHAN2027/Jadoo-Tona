import ConceptualQuestion from '../models/conceptualQuestion.model.js';

/**
 * Get random conceptual questions
 * Weighted by difficulty: Easy: 40%, Medium: 40%, Hard: 20%
 */
export const getRandomQuestions = async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 5;
    const category = req.query.category; // Optional filter

    // Calculate counts for each difficulty
    const easyCount = Math.floor(count * 0.4);
    const mediumCount = Math.floor(count * 0.4);
    const hardCount = count - easyCount - mediumCount;

    const matchStage = category ? { category } : {};

    // Fetch questions by difficulty
    const easyQuestions = await ConceptualQuestion.aggregate([
      { $match: { ...matchStage, difficulty: 'Easy' } },
      { $sample: { size: easyCount } }
    ]);

    const mediumQuestions = await ConceptualQuestion.aggregate([
      { $match: { ...matchStage, difficulty: 'Medium' } },
      { $sample: { size: mediumCount } }
    ]);

    const hardQuestions = await ConceptualQuestion.aggregate([
      { $match: { ...matchStage, difficulty: 'Hard' } },
      { $sample: { size: hardCount } }
    ]);

    // Combine and shuffle
    const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);

    // Don't send expectedKeyPoints or sampleAnswer to client (prevent cheating)
    const sanitized = shuffled.map(q => ({
      _id: q._id,
      category: q.category,
      difficulty: q.difficulty,
      question: q.question,
      topic: q.topic
    }));

    res.json({
      success: true,
      count: sanitized.length,
      questions: sanitized
    });
  } catch (error) {
    console.error('Error fetching random questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions'
    });
  }
};

/**
 * Get question by ID (with full details for evaluation)
 */
export const getQuestionById = async (req, res) => {
  try {
    const question = await ConceptualQuestion.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    res.json({
      success: true,
      question
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch question'
    });
  }
};

/**
 * Get all categories
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await ConceptualQuestion.distinct('category');
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
};

/**
 * Get question statistics
 */
export const getStatistics = async (req, res) => {
  try {
    const totalCount = await ConceptualQuestion.countDocuments();
    
    const byCategory = await ConceptualQuestion.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const byDifficulty = await ConceptualQuestion.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      statistics: {
        total: totalCount,
        byCategory: byCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byDifficulty: byDifficulty.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
};
