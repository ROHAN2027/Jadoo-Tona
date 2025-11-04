import axios from 'axios';
import Problem from '../models/Problem.js'; 

// --- Helper: Map friendly names to Judge0 Language IDs ---
const languageMap = {
  python: 71,
  javascript: 93,
  cpp: 54, // Example: C++ (GCC 9.2.0)
};

// --- Helper: Get API Keys from Environment Variables ---
// IMPORTANT: Add these to a .env file
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_API_HOST = 'judge0-ce.p.rapidapi.com';
const JUDGE0_URL = `https://${JUDGE0_API_HOST}/submissions`;

/**
 * --- Helper: Builds the full runnable script ---
 * This is the "driver code" part. It combines the user's
 * function with the test case input to make a runnable script.
 */
const buildDriverScript = (language, userCode, testCaseInput) => {
  if (language === 'python') {
    // Assumes userCode is a class 'Solution' with a method 'twoSum'
    // and testCaseInput is like "[2, 7, 11, 15], 9"
    return `
${userCode}

# Driver code
try:
    s = Solution()
    # Dynamically unpack the test case input
    result = s.twoSum(${testCaseInput})
    print(result) # Print result to stdout
except Exception as e:
    print(e)
`;
  } else if (language === 'javascript') {
    // Assumes userCode is a function 'twoSum'
    // and testCaseInput is like "[2, 7, 11, 15], 9"
    return `
${userCode}

// Driver code
try {
    // Dynamically unpack the test case input
    const [nums, target] = [${testCaseInput}];
    const result = twoSum(nums, target);
    console.log(result); // Print result to stdout
} catch (e) {
    console.error(e);
}
`;
  }
  // Add more languages (like C++) here
  return userCode; // Fallback
};

/**
 * --- The Main Controller ---
 * Handles the POST /submit/:slug request
 */
export const handleSubmit = async (req, res) => {
  const { slug } = req.params;
  const { code, language } = req.body;

  // 1. Input Validation
  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required.' });
  }

  const language_id = languageMap[language];
  if (!language_id) {
    return res.status(400).json({ error: 'Unsupported language.' });
  }

  try {
    // 2. Find the problem and its test cases
    const problem = await Problem.findOne({ slug: slug });
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    // 3. Loop through each test case and call Judge0
    for (const testCase of problem.test_cases) {
      // 3a. Build the full script
      const script = buildDriverScript(language, code, testCase.input);

      // 3b. Encode for Judge0
      const source_code_b64 = Buffer.from(script).toString('base64');
      const expected_output_b64 = Buffer.from(
        testCase.expected_output
      ).toString('base64');

      // 3c. Set up Judge0 API call
      const options = {
        method: 'POST',
        url: JUDGE0_URL,
        params: {
          base64_encoded: 'true',
          wait: 'true', // Wait for the submission to finish
        },
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': JUDGE0_API_HOST,
        },
        data: {
          language_id: language_id,
          source_code: source_code_b64,
          expected_output: expected_output_b64,
          // We don't need stdin because the input is in the script
        },
      };

      // 3d. Make the API call
      const response = await axios.request(options);
      const result = response.data;
      const status = result.status.description;

      // 3e. Check if this test case failed
      if (status !== 'Accepted') {
        // Decode error messages from base64
        const compile_output = result.compile_output
          ? Buffer.from(result.compile_output, 'base64').toString('utf-8')
          : null;
        const stderr = result.stderr
          ? Buffer.from(result.stderr, 'base64').toString('utf-8')
          : null;

        // Stop and send the *first* failure
        return res.json({
          status: status,
          testCase: testCase.input,
          compile_output: compile_output,
          stderr: stderr,
        });
      }
    }

    // 4. If all test cases passed
    return res.status(200).json({ status: 'Accepted' });
  } catch (error) {
    // Handle errors from DB query or Judge0 call
    console.error('Submission Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
};