const axios = require('axios');

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

const headers = {
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
  'X-RapidAPI-Key': JUDGE0_API_KEY,
  'Content-Type': 'application/json',
};

// Submit code for execution
const submitCode = async (code, languageId, stdin = '', options = {}) => {
  try {
    const data = {
      source_code: code,
      language_id: languageId,
      stdin,
      cpu_time_limit: options.timeLimit || 5,
      memory_limit: options.memoryLimit || 128000, // Convert MB to KB
      wait: false
    };

    const response = await axios.post(`${JUDGE0_API_URL}/submissions`, data, { headers });
    return response.data.token;
  } catch (error) {
    throw new Error('Error submitting code: ' + error.message);
  }
};

// Get submission result
const getSubmissionResult = async (token) => {
  try {
    const response = await axios.get(`${JUDGE0_API_URL}/submissions/${token}`, { headers });
    return response.data;
  } catch (error) {
    throw new Error('Error getting submission result: ' + error.message);
  }
};

// Poll for submission result until it's ready
const pollSubmissionResult = async (token, maxAttempts = 10, interval = 1000) => {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await getSubmissionResult(token);
    
    // Status ID explanations:
    // 1: In Queue, 2: Processing
    // 3: Accepted, 4: Wrong Answer
    // 5: Time Limit Exceeded, 6: Compilation Error
    // 7: Runtime Error (SIGSEGV), 8: Runtime Error (SIGXFSZ)
    // 9: Runtime Error (SIGFPE), 10: Runtime Error (SIGABRT)
    // 11: Runtime Error (NZEC), 12: Runtime Error (Other)
    // 13: Internal Error, 14: Exec Format Error
    
    if (result.status.id > 2) { // Not queued or processing anymore
      return {
        success: result.status.id === 3,
        output: result.stdout || '',
        error: result.stderr || result.status.description,
        executionTime: result.time,
        memory: result.memory,
        statusId: result.status.id
      };
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Timeout waiting for submission result');
};

// Execute code and get results
const executeCode = async (code, languageId, input = '', options = {}) => {
  try {
    const token = await submitCode(code, languageId, input, options);
    return await pollSubmissionResult(token);
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: '',
      executionTime: null,
      memory: null
    };
  }
};

module.exports = {
  executeCode,
  submitCode,
  getSubmissionResult,
  pollSubmissionResult
};
