import axios from 'axios';

const JUDGE0_API_URL = import.meta.env.VITE_JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = import.meta.env.VITE_JUDGE0_API_KEY || '4c9b78c691msh97368a3c7ae2607p1f5585jsnd15998f8ab42';

const headers = {
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
  'X-RapidAPI-Key': JUDGE0_API_KEY,
  'Content-Type': 'application/json',
};

// Language IDs for Judge0
const LANGUAGE_IDS = {
  java: 62,    // Java (OpenJDK 13.0.1)
  python: 71,  // Python (3.8.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
};

// Submit code for execution
export const submitCode = async (code, languageId, stdin = '') => {
  try {
    const submission = await axios.post(`${JUDGE0_API_URL}/submissions`, {
      source_code: code,
      language_id: languageId,
      stdin,
      wait: false,
    }, { headers });

    return submission.data.token;
  } catch (error) {
    throw new Error('Error submitting code: ' + error.message);
  }
};

// Get submission result
export const getSubmissionResult = async (token) => {
  try {
    const result = await axios.get(`${JUDGE0_API_URL}/submissions/${token}`, { headers });
    return result.data;
  } catch (error) {
    throw new Error('Error getting submission result: ' + error.message);
  }
};

// Poll for submission result until it's ready
export const pollSubmissionResult = async (token, maxAttempts = 10, interval = 1000) => {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await getSubmissionResult(token);
    
    // Status ID explanations:
    // 1: In Queue, 2: Processing
    // 3: Accepted, 4: Wrong Answer
    // 5: Time Limit Exceeded, 6: Compilation Error
    // 7: Runtime Error (SIGSEGV)
    if (result.status.id > 2) { // Not queued or processing anymore
      return {
        success: result.status.id === 3, // Only status 3 is considered successful
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

// Helper to get language ID
export const getLanguageId = (language) => {
  const id = LANGUAGE_IDS[language.toLowerCase()];
  if (!id) throw new Error(`Unsupported language: ${language}`);
  return id;
};

// Execute code and get results
export const executeCode = async (code, language, input = '') => {
  try {
    const languageId = getLanguageId(language);
    
    // Add boilerplate code for specific languages
    let processedCode = code;
    if (language === 'java' && !code.includes('public class')) {
      processedCode = `
public class Main {
    public static void main(String[] args) {
        ${code}
    }
}`;
    }

    // Submit code and get token
    const token = await submitCode(processedCode, languageId, input);
    
    // Poll for results
    const result = await pollSubmissionResult(token);
    
    // Process specific error cases
    if (result.statusId === 6) { // Compilation Error
      return {
        success: false,
        error: 'Compilation Error: ' + (result.error || result.status.description),
        output: '',
        executionTime: null,
        memory: null,
        statusId: result.statusId
      };
    }
    
    if (result.statusId === 5) { // Time Limit Exceeded
      return {
        success: false,
        error: 'Time Limit Exceeded',
        output: result.output || '',
        executionTime: result.executionTime,
        memory: result.memory,
        statusId: result.statusId
      };
    }
    
    return result;
  } catch (error) {
    console.error('Code execution error:', error);
    return {
      success: false,
      error: error.message,
      output: '',
      executionTime: null,
      memory: null,
      statusId: -1
    };
  }
};
