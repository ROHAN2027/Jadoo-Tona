import Problem from '../models/problems.model.js';

// --- GET RANDOM QUESTIONS WITH WEIGHTED PROBABILITY ---
export const getRandomQuestions = async (req, res) => {
  try {
    const requestedCount = parseInt(req.query.count) || 5; // Default to 5 questions if not specified

    // Time limits in minutes based on difficulty
    const timeLimits = {
      'Easy': 10,
      'Medium': 15,
      'Hard': 20
    };

    // Get all problems grouped by difficulty
    const [easyProblems, mediumProblems, hardProblems] = await Promise.all([
      Problem.find({ difficulty: 'Easy' }).select('_id title difficulty'),
      Problem.find({ difficulty: 'Medium' }).select('_id title difficulty'),
      Problem.find({ difficulty: 'Hard' }).select('_id title difficulty')
    ]);

    if (easyProblems.length === 0 && mediumProblems.length === 0 && hardProblems.length === 0) {
      return res.status(404).json({ error: 'No problems found in the database.' });
    }

    // Calculate total available problems
    const totalAvailable = easyProblems.length + mediumProblems.length + hardProblems.length;
    const count = Math.min(requestedCount, totalAvailable);

    // Create copies of the arrays to track available problems
    const availableEasy = [...easyProblems];
    const availableMedium = [...mediumProblems];
    const availableHard = [...hardProblems];
    
    const selectedQuestions = [];
    const selectedIds = new Set(); // Track selected problem IDs to avoid duplicates
    
    // Select questions based on weighted probability (50% Hard, 25% Medium, 25% Easy)
    let attempts = 0;
    const maxAttempts = count * 3; // Prevent infinite loop

    while (selectedQuestions.length < count && attempts < maxAttempts) {
      attempts++;
      const random = Math.random() * 100;
      let selectedProblem;
      let sourceArray;

      if (random < 50 && availableHard.length > 0) {
        // 50% chance for Hard
        sourceArray = availableHard;
      } else if (random < 75 && availableMedium.length > 0) {
        // 25% chance for Medium
        sourceArray = availableMedium;
      } else if (availableEasy.length > 0) {
        // 25% chance for Easy
        sourceArray = availableEasy;
      } else {
        // Fallback: pick from any available difficulty
        if (availableHard.length > 0) sourceArray = availableHard;
        else if (availableMedium.length > 0) sourceArray = availableMedium;
        else if (availableEasy.length > 0) sourceArray = availableEasy;
      }

      if (sourceArray && sourceArray.length > 0) {
        const randomIndex = Math.floor(Math.random() * sourceArray.length);
        selectedProblem = sourceArray[randomIndex];

        // Check if we haven't selected this problem before
        if (!selectedIds.has(selectedProblem._id.toString())) {
          selectedIds.add(selectedProblem._id.toString());
          selectedQuestions.push({
            id: selectedProblem._id,
            title: selectedProblem.title,
            difficulty: selectedProblem.difficulty,
            timeLimit: timeLimits[selectedProblem.difficulty] // in minutes
          });

          // Remove the selected problem from the available pool
          sourceArray.splice(randomIndex, 1);
        }
      }
    }

    res.status(200).json({
      requested: requestedCount,
      available: totalAvailable,
      count: selectedQuestions.length,
      questions: selectedQuestions
    });

  } catch (error) {
    console.error('Get Random Questions Error:', error.message);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
};

export const getProblem = async (req, res) => {
  const { title } = req.params;

  try {
    // Find the problem and select only the fields you need
    const problem = await Problem.findOne({ title: title }).select(
      'title description difficulty boilerplate_code examples constraints'
    );
    // Note: We don't send testcase to the client!
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    res.status(200).json(problem);
  } catch (error) {
    console.error('Get Problem Error:', error.message);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
};

// --- CREATE A NEW PROBLEM ---
export const createProblem = async (req, res) => {
  try {
    // We pass the entire req.body to the Problem model
    const newProblem = new Problem(req.body);

    await newProblem.save();

    res.status(201).json({ 
      message: 'Problem created successfully!', 
      problem: newProblem 
    });

  } catch (error) {
    // This will catch validation errors (e.g., missing title)
    // or the 'unique' error if the title already exists.
    console.error('Create Problem Error:', error.message);
    if (error.code === 11000) { // Duplicate key error
      return res.status(409).json({ error: 'A problem with this title already exists.' });
    }
    res.status(400).json({ error: error.message });
  }
};