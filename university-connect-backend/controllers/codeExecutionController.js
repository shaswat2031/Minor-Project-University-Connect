const CodingQuestion = require('../models/CodingQuestion');
const { executeCode } = require('../services/judge0Service');

// Language mapping for Judge0
const LANGUAGE_IDS = {
  JavaScript: 63,  // Node.js 12.14.0
  Python: 71,      // Python 3.8.1
  Java: 62,        // OpenJDK 13.0.1
};

// Execute submitted code
exports.executeCode = async (req, res) => {
  try {
    const { code, language, questionId, testCaseIndex } = req.body;

    // Enhanced input validation
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required'
      });
    }

    if (!language) {
      return res.status(400).json({
        success: false,
        error: 'Programming language is required'
      });
    }

    if (!LANGUAGE_IDS[language]) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language: ${language}. Supported languages are: ${Object.keys(LANGUAGE_IDS).join(', ')}`
      });
    }

    if (!questionId) {
      return res.status(400).json({
        success: false,
        error: 'Question ID is required'
      });
    }

    // Get question details with error handling
    let question;
    try {
      question = await CodingQuestion.findById(questionId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid question ID format'
      });
    }

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Validate language matches question requirements
    if (question.language.toLowerCase() !== language.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: `This question requires ${question.language}. Submitted code is in ${language}`
      });
    }

    // Get test case with validation
    const testCase = testCaseIndex !== undefined 
      ? question.testCases[testCaseIndex]
      : null;

    if (testCaseIndex !== undefined) {
      if (testCaseIndex < 0 || testCaseIndex >= question.testCases.length) {
        return res.status(400).json({
          success: false,
          error: `Invalid test case index. Must be between 0 and ${question.testCases.length - 1}`
        });
      }
      
      if (!testCase) {
        return res.status(404).json({
          success: false,
          error: 'Test case not found'
        });
      }
    }

    // Execute code with timeout handling
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Execution timeout')), 30000); // 30 second timeout
    });

    const executionPromise = executeCode(
      code,
      LANGUAGE_IDS[language],
      testCase ? testCase.input : '',
      {
        timeLimit: question.timeLimit,
        memoryLimit: question.memoryLimit
      }
    );

    // Race between execution and timeout
    const result = await Promise.race([executionPromise, timeoutPromise]);

    // Process execution result
    if (testCase) {
      const normalizedOutput = (result.output || '').trim().replace(/\n/g, '\n');
      const normalizedExpected = testCase.expectedOutput.trim().replace(/\n/g, '\n');
      
      // Add detailed comparison info
      result.expected = testCase.expectedOutput;
      result.comparison = {
        success: normalizedOutput === normalizedExpected,
        outputLength: normalizedOutput.length,
        expectedLength: normalizedExpected.length,
        differences: normalizedOutput !== normalizedExpected ? 
          `Expected length: ${normalizedExpected.length}, Got length: ${normalizedOutput.length}` : 
          null
      };
      
      result.success = result.comparison.success;
    }

    // Add execution metadata
    const response = {
      ...result,
      metadata: {
        timeLimit: question.timeLimit,
        memoryLimit: question.memoryLimit,
        language: language,
        testCaseIndex: testCaseIndex
      }
    };

    return res.json(response);
  } catch (error) {
    console.error('Code execution error:', error);
    
    // Handle different types of errors
    if (error.message === 'Execution timeout') {
      return res.status(408).json({
        success: false,
        error: 'Code execution timed out',
        details: 'Your code took too long to execute. Please optimize your solution.'
      });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        details: 'Please wait a moment before trying again'
      });
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
      return res.status(503).json({
        success: false,
        error: 'Judge0 service unavailable',
        details: 'The code execution service is temporarily unavailable. Please try again later.'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    // Handle MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format',
        details: 'The provided question ID is not valid'
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
};

// Run all test cases
exports.runAllTests = async (req, res) => {
  try {
    const { code, questionId } = req.body;

    // Validate input
    if (!code || !questionId) {
      return res.status(400).json({
        success: false,
        error: 'Code and questionId are required'
      });
    }

    // Get question details
    const question = await CodingQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    const results = [];
    let passedTests = 0;

    // Run each test case
    for (let i = 0; i < question.testCases.length; i++) {
      const testCase = question.testCases[i];
      const result = await executeCode(
        code,
        LANGUAGE_IDS[question.language],
        testCase.input,
        {
          timeLimit: question.timeLimit,
          memoryLimit: question.memoryLimit
        }
      );

      // Compare output
      const normalizedOutput = result.output.trim();
      const normalizedExpected = testCase.expectedOutput.trim();
      result.success = normalizedOutput === normalizedExpected;

      if (result.success) {
        passedTests++;
      }

      results.push(result);
    }

    // Calculate score
    const pointsPerTest = Math.floor(100 / question.testCases.length);
    const score = passedTests * pointsPerTest;

    // Update question stats
    await CodingQuestion.findByIdAndUpdate(questionId, {
      $inc: {
        totalTestCases: question.testCases.length,
        passedTestCases: passedTests,
        score: score
      }
    });

    return res.json({
      success: true,
      results,
      score,
      passedTests,
      totalTests: question.testCases.length
    });
  } catch (error) {
    console.error('Test execution error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error running tests: ' + error.message
    });
  }
};
