import axios from 'axios';
import Problem from '../models/problems.model.js';
import 'dotenv/config'; 

// --- ADD THESE CONSTANTS ---
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_API_HOST = 'judge0-ce.p.rapidapi.com';
const JUDGE0_BATCH_URL = 'https://judge0-ce.p.rapidapi.com/submissions/batch';
const JUDGE0_BASE_URL = 'https://judge0-ce.p.rapidapi.com/submissions';

const languageMap = {
  javascript: 93,
  python: 71,
  java: 62,
  cpp: 54,
};

// --- HELPER FUNCTION ---

function buildDriverScript(userCode, driverTemplate, language) {
  const placeholders = {
    python: '# [USER_CODE_WILL_BE_INSERTED_HERE]',
    javascript: '// [USER_CODE_WILL_BE_INSERTED_HERE]',
    java: '// [USER_CODE_WILL_BE_INSERTED_HERE]',
    cpp: '// [USER_CODE_WILL_BE_INSERTED_HERE]',
  };
  
  const placeholder = placeholders[language];
  if (!placeholder) {
    throw new Error(`Invalid language for placeholder: ${language}`);
  }
  
  return driverTemplate.replace(placeholder, userCode);
}

function decodeBase64(str) {
  if (!str) return null;
  return Buffer.from(str, 'base64').toString('utf-8');
}

/**
 * Compare two outputs by parsing as JSON
 */
function compareOutputs(actual, expected) {
  try {
    // Remove whitespace and compare
    const actualTrimmed = actual?.trim();
    const expectedTrimmed = expected?.trim();
    
    // Try to parse as JSON and compare
    try {
      const actualParsed = JSON.parse(actualTrimmed);
      const expectedParsed = JSON.parse(expectedTrimmed);
      return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed);
    } catch {
      // If not valid JSON, do string comparison
      return actualTrimmed === expectedTrimmed;
    }
  } catch {
    return false;
  }
}

async function fetchBatchResults(tokens) {
  const tokensParam = tokens.join(',');
  
  const options = {
    method: 'GET',
    url: `${JUDGE0_BASE_URL}/batch`,
    params: { 
      tokens: tokensParam,
      base64_encoded: 'true'
    },
    headers: {
      'X-RapidAPI-Key': JUDGE0_API_KEY,
      'X-RapidAPI-Host': JUDGE0_API_HOST,
    },
  };

  const response = await axios.request(options);
  return response.data.submissions;
}

async function processBatch(userCode, driverTemplate, language, language_id, testCases, compareOutput = false) {
  const fullScript = buildDriverScript(userCode, driverTemplate, language);
  const source_code_b64 = Buffer.from(fullScript).toString('base64');

  const submissions = testCases.map((testCase) => {
    const submission = {
      language_id: language_id,
      source_code: source_code_b64,
      stdin: Buffer.from(testCase.input).toString('base64'),
    };
    // Don't send expected_output to Judge0, we'll compare manually
    return submission;
  });

  const createOptions = {
    method: 'POST',
    url: JUDGE0_BATCH_URL,
    params: { base64_encoded: 'true' },
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_API_KEY,
      'X-RapidAPI-Host': JUDGE0_API_HOST,
    },
    data: {
      submissions: submissions,
    },
  };

  const createResponse = await axios.request(createOptions);
  const tokens = createResponse.data.map(item => item.token);

  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  let results;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    results = await fetchBatchResults(tokens);
    
    const allDone = results.every(r => r.status.id !== 1 && r.status.id !== 2);
    
    if (allDone) {
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }

  // If compareOutput is true, add comparison results
  if (compareOutput) {
    results = results.map((result, index) => {
      const actualOutput = decodeBase64(result.stdout);
      const expectedOutput = testCases[index].expected_output;
      
      // Only mark as accepted if status is 3 (Accepted) AND outputs match
      if (result.status.id === 3) {
        const outputsMatch = compareOutputs(actualOutput, expectedOutput);
        if (outputsMatch) {
          result.status.description = 'Accepted';
        } else {
          result.status.id = 4; // Wrong Answer
          result.status.description = 'Wrong Answer';
        }
      }
      
      return result;
    });
  }
  
  return results;
}

// --- CONTROLLERS ---

export const handleRun = async (req, res) => {
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
    const problem = await Problem.findOne({ title: title }).select('testcase driver_code');
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    const driverTemplate = problem.driver_code.get(language);
    if (!driverTemplate) {
      return res.status(400).json({ error: `Driver code for ${language} not found.` });
    }

    const results = await processBatch(
      code,
      driverTemplate,
      language,
      language_id,
      problem.testcase,
      false
    );

    const formattedResults = results.map((result, index) => {
        const status = result?.status?.description || 'Unknown';
        return {
            status: status,
            testCase: problem.testcase[index].input,
            stdout: decodeBase64(result?.stdout),
            stderr: decodeBase64(result?.stderr),
            compile_output: decodeBase64(result?.compile_output),
            time: result?.time,
            memory: result?.memory,
        };
    });
    
    return res.status(200).json({ results: formattedResults });

  } catch (error) {
    console.error('Run Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'An internal server error occurred.', details: error.message });
  }
};

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
    const problem = await Problem.findOne({ title: title }).select('hidden_testcases driver_code');
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    if (!problem.hidden_testcases || problem.hidden_testcases.length === 0) {
      return res.status(400).json({ error: 'No hidden test cases found for this problem.' });
    }

    const driverTemplate = problem.driver_code.get(language);
    if (!driverTemplate) {
      return res.status(400).json({ error: `Driver code for ${language} not found.` });
    }

    const results = await processBatch(
      code,
      driverTemplate,
      language,
      language_id,
      problem.hidden_testcases,
      true // true = Compare output
    );

    if (!Array.isArray(results)) {
      return res.status(500).json({ 
        error: 'Invalid response from code execution service.',
        details: results
      });
    }

    // Check results for the first failure
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      
      if (!result || !result.status) {
        return res.status(500).json({
          error: 'Invalid result from code execution service.',
          testCaseNumber: i + 1,
          result: result
        });
      }

      const status = result.status.description;

      if (status !== 'Accepted') {
        return res.status(200).json({
          status: status,
          testCaseNumber: i + 1,
          totalTestCases: results.length,
          compile_output: decodeBase64(result.compile_output),
          stderr: decodeBase64(result.stderr),
          stdout: decodeBase64(result.stdout),
          expected: problem.hidden_testcases[i].expected_output
        });
      }
    }

    return res.status(200).json({ 
        status: 'Accepted',
        totalTestCases: results.length 
    });

  } catch (error) {
    console.error('Submission Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'An internal server error occurred.', 
      details: error.message
    });
  }
};