import Problem from '../models/problems.model.js';

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