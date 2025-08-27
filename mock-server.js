// Simple mock server for testing certification functionality
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock certification questions with DSA problems
const mockQuestions = [
  {
    _id: "1",
    type: "coding",
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]

Example 2: 
Input: nums = [3,2,4], target = 6
Output: [1,2]`,
    language: "JavaScript",
    difficulty: "Easy",
    starterCode: `function twoSum(nums, target) {
    // Write your solution here
    
}`,
    testCases: [
      {
        input: "[[2,7,11,15], 9]",
        expectedOutput: "[0,1]",
        description: "Basic case with target 9"
      },
      {
        input: "[[3,2,4], 6]",
        expectedOutput: "[1,2]", 
        description: "Different indices"
      },
      {
        input: "[[3,3], 6]",
        expectedOutput: "[0,1]",
        description: "Duplicate numbers"
      }
    ]
  },
  {
    _id: "2", 
    type: "mcq",
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    correctAnswer: "O(log n)"
  },
  {
    _id: "3",
    type: "coding", 
    title: "Valid Parentheses",
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

Example 1:
Input: s = "()"
Output: true

Example 2:
Input: s = "()[]{}"  
Output: true

Example 3:
Input: s = "(]"
Output: false`,
    language: "JavaScript",
    difficulty: "Easy",
    starterCode: `function isValid(s) {
    // Write your solution here
    
}`,
    testCases: [
      {
        input: '["()"]',
        expectedOutput: "true",
        description: "Simple parentheses"
      },
      {
        input: '["()[]{}", ""]', 
        expectedOutput: "true",
        description: "Mixed brackets"
      },
      {
        input: '["(]"]',
        expectedOutput: "false", 
        description: "Mismatched brackets"
      }
    ]
  },
  {
    _id: "4",
    type: "coding", 
    title: "Palindrome Number",
    description: `Given an integer x, return true if x is palindrome integer.

Example 1:
Input: x = 121
Output: true

Example 2:
Input: x = -121
Output: false`,
    language: "JavaScript",
    difficulty: "Easy", 
    starterCode: `function isPalindrome(x) {
    // Write your solution here
    
}`,
    testCases: [
      {
        input: "[121]",
        expectedOutput: "true",
        description: "Positive palindrome"
      },
      {
        input: "[-121]",
        expectedOutput: "false",
        description: "Negative number"
      }
    ]
  }
];

// Route to get questions for a category
app.get('/api/certifications/questions', (req, res) => {
  const { category } = req.query;
  console.log('Fetching questions for category:', category);
  
  // Return mock questions
  res.json(mockQuestions);
});

// Route to execute code (mock Judge0)
app.post('/api/coding/execute', (req, res) => {
  const { code, input, language } = req.body;
  console.log('Executing code:', { code: code.substring(0, 50) + '...', input, language });
  
  // Mock execution result
  setTimeout(() => {
    res.json({
      success: true,
      output: "Mock execution successful!\nInput processed: " + input,
      executionTime: "0.1s",
      memoryUsed: "2MB"
    });
  }, 1000);
});

// Route to run test cases
app.post('/api/coding/test', (req, res) => {
  const { code, testCases, language } = req.body;
  console.log('Running test cases for code:', code.substring(0, 50) + '...');
  
  // Mock test results
  setTimeout(() => {
    const results = testCases.map((testCase, index) => ({
      passed: Math.random() > 0.2, // 80% pass rate for demo
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: testCase.expectedOutput + (Math.random() > 0.8 ? "_modified" : ""),
      executionTime: "0.1s"
    }));
    
    res.json({
      success: true,
      results,
      allPassed: results.every(r => r.passed)
    });
  }, 1500);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
  console.log('📚 Available routes:');
  console.log('  GET  /api/certifications/questions?category=Array');
  console.log('  POST /api/coding/execute');
  console.log('  POST /api/coding/test');
});
