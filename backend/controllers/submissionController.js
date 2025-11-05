import axios from 'axios';
import Problem from '../models/problems.model.js'; // Make sure this path is correct
import 'dotenv/config'; 

// --- Helper: Map friendly names to Judge0 Language IDs ---
const languageMap = {
  python: 71,
  javascript: 93,
  cpp: 54, 
};

// --- Helper: Get API Keys from Environment Variables ---
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_API_HOST = 'judge0-ce.p.rapidapi.com';
const JUDGE0_URL = `https://${JUDGE0_API_HOST}/submissions`;

/**
 * --- Helper: Builds the full runnable script ---
 *
 * This is the CORRECT, simplified function.
 * It just combines the user's code with the driver code
 * template from the database.
 */
const buildDriverScript = (userCode, driverTemplate, testCaseInput) => {
  // Replace the placeholder with the actual test case input
  const driver = driverTemplate.replace(/\$\{input\}/g, testCaseInput);

  // Just combine them. All language-specific logic (like #includes
  // or 'try/catch') should be IN THE TEMPLATE from the database.
  return `
${userCode}

${driver}
`;
};

/**
 * --- The Main Controller ---
 * Handles the POST /submit/:title request
 * (This is the same as the last version, which was correct)
 */
export const handleSubmit = async (req, res) => {
  const { title } = req.params;
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required.' });
  }

  const language_id = languageMap[language];
  if (!language_id) {
    return res.status(400).json({ error: 'Unsupported language.' });
  }

  try {
    const problem = await Problem.findOne({ title: title }).select(
      'testcase driver_code'
    );
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    const driverTemplate = problem.driver_code.get(language);
    
    if (!driverTemplate) {
      return res.status(400).json({
        error: `Driver code for language "${language}" not found for this problem.`,
      });
    }

    for (const testCase of problem.testcase) {
      const script = buildDriverScript(
        code,           // The user's submitted code
        driverTemplate, // The template from the DB
        testCase.input  // The specific test case input
      );

      const source_code_b64 = Buffer.from(script).toString('base64');
      const expected_output_b64 = Buffer.from(
        testCase.expected_output
      ).toString('base64');

      const options = {
        method: 'POST',
        url: JUDGE0_URL,
        params: { base64_encoded: 'true', wait: 'true' },
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': JUDGE0_API_HOST,
        },
        data: {
          language_id: language_id,
          source_code: source_code_b64,
          expected_output: expected_output_b64,
        },
      };

      const response = await axios.request(options);
      const result = response.data;
      const status = result.status.description;

      if (status !== 'Accepted') {
        const compile_output = result.compile_output
          ? Buffer.from(result.compile_output, 'base64').toString('utf-8')
          : null;
        const stderr = result.stderr
          ? Buffer.from(result.stderr, 'base64').toString('utf-8')
          : null;

        return res.json({
          status: status,
          testCase: testCase.input,
          compile_output: compile_output,
          stderr: stderr || "Runtime Error",
        });
      }
    }

    return res.status(200).json({ status: 'Accepted' });

  } catch (error) {
    console.error('Submission Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
};