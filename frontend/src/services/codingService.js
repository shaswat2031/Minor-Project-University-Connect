import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fetch coding questions by category and language
export const fetchCodingQuestions = async (category, language) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/coding/questions`, {
      params: { category, language }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching coding questions:', error);
    throw error;
  }
};

// Execute code against test cases
export const executeCode = async (code, language, questionId, testCaseIndex) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/code/execute`, {
      code,
      language,
      questionId,
      testCaseIndex
    });
    return response.data;
  } catch (error) {
    console.error('Error executing code:', error);
    throw error;
  }
};

// Submit final solution
export const submitSolution = async (questionId, userId, code, language, results) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/code/submit`, {
      questionId,
      userId,
      code,
      language,
      results
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting solution:', error);
    throw error;
  }
};

// Get user's coding progress
export const getCodingProgress = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/code/progress/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching coding progress:', error);
    throw error;
  }
};
