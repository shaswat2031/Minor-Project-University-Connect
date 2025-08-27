import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/certifications`;

/**
 * Execute a coding test case
 * @param {string} code - The code to execute
 * @param {string} language - The programming language (Java, JavaScript, Python)
 * @param {string} questionId - The ID of the question
 * @param {number} testCaseIndex - The index of the test case to execute
 * @returns {Promise<Object>} - The execution result
 */
export const executeCodingTest = async (code, language, questionId, testCaseIndex) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log(`🚀 Executing ${language} code for question ${questionId}, test case ${testCaseIndex}`);
    
    // Use the correct endpoint for code execution
    const endpoint = `${API_URL}/coding/execute`;
    
    const response = await axios.post(
      endpoint,
      {
        code,
        language,
        questionId,
        testCaseIndex,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(`✅ Execution result:`, response.data);

    // Handle the new response format from our improved backend
    const result = response.data;
    
    if (result.success === false) {
      // Handle backend errors
      return {
        passed: false,
        output: result.message || result.error || "Execution failed",
        expected: result.expected || "",
        error: true,
        executionTime: null,
        memory: null,
        status: "Error",
        input: result.input || ""
      };
    }

    // Return standardized format for successful executions
    return {
      passed: result.passed || false,
      output: result.output || "",
      expected: result.expected || "",
      executionTime: result.executionTime || null,
      memory: result.memory || null,
      status: result.status || "Unknown",
      statusId: result.statusId || null,
      stderr: result.stderr || null,
      input: result.input || "",
      error: false
    };

  } catch (error) {
    console.error("❌ Error executing code:", error);
    
    // Return a standardized error response
    return {
      passed: false,
      output: error.response?.data?.message || error.response?.data?.error || error.message || "Error executing code",
      expected: "",
      error: true,
      executionTime: null,
      memory: null,
      status: "Network Error",
      input: ""
    };
  }
};

/**
 * Run all test cases for a coding question
 * @param {string} code - The code to execute
 * @param {string} language - The programming language
 * @param {string} questionId - The ID of the question
 * @param {Array} testCases - The test cases to run
 * @returns {Promise<Array>} - The execution results for all test cases
 */
export const runAllTestCases = async (code, language, questionId, testCases) => {
  try {
    const results = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const result = await executeCodingTest(code, language, questionId, i);
      results.push(result);
    }
    
    return results;
  } catch (error) {
    console.error("Error running all test cases:", error);
    throw error;
  }
};

export default {
  executeCodingTest,
  runAllTestCases,
};
