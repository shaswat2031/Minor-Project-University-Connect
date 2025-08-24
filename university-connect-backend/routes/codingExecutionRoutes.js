const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const authMiddleware = require('../middleware/authMiddleware');
const CodingQuestion = require('../models/CodingQuestion');
const util = require('util');
const execPromise = util.promisify(exec);

// Create temporary directories if they don't exist
const tempDir = path.join(__dirname, '../temp');
const javaDir = path.join(tempDir, 'java');
const jsDir = path.join(tempDir, 'js');
const pythonDir = path.join(tempDir, 'python');

[tempDir, javaDir, jsDir, pythonDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Execute coding test cases
router.post('/execute', authMiddleware, async (req, res) => {
  console.log('Code execution request received');
  
  try {
    const { code, language, questionId, testCaseIndex } = req.body;
    console.log(`Language: ${language}, Question ID: ${questionId}, Test Case Index: ${testCaseIndex}`);

    if (!code || !language || !questionId) {
      return res.status(400).json({ 
        passed: false, 
        output: 'Missing required parameters: code, language, or questionId' 
      });
    }

    // Find the question and get test cases
    const question = await CodingQuestion.findById(questionId);

    if (!question) {
      console.log(`Question with ID ${questionId} not found`);
      console.log(`Creating dummy test case for ${language}`);
      
      // Create a dummy test case if needed
      let dummyTestCase = {
        input: "3 5",
        expectedOutput: "8"
      };
      
      // Handle different languages
      let result;
      switch (language.toLowerCase()) {
        case 'java':
          result = await executeJavaCode(code, dummyTestCase, questionId);
          break;
        case 'javascript':
        case 'js':
          result = await executeJavaScriptCode(code, dummyTestCase, questionId);
          break;
        case 'python':
        case 'py':
          result = await executePythonCode(code, dummyTestCase, questionId);
          break;
        default:
          return res.status(400).json({ 
            passed: false, 
            output: 'Unsupported language: ' + language
          });
      }
      
      return res.json(result);
    }

    console.log(`Found question: ${question.title}`);
    console.log(`Question has ${question.testCases ? question.testCases.length : 0} test cases`);

    // Get the test case to execute
    const testCase = question.testCases[testCaseIndex];
    if (!testCase) {
      console.log(`Test case index ${testCaseIndex} not found for question ${questionId}`);
      return res.status(404).json({ 
        passed: false, 
        output: 'Test case not found' 
      });
    }

    console.log(`Executing ${language} code for test case ${testCaseIndex}`);
    console.log(`Test case input: ${testCase.input}`);
    console.log(`Test case expected output: ${testCase.expectedOutput}`);
    
    // Handle different languages
    let result;
    switch (language.toLowerCase()) {
      case 'java':
        result = await executeJavaCode(code, testCase, questionId);
        break;
      case 'javascript':
      case 'js':
        result = await executeJavaScriptCode(code, testCase, questionId);
        break;
      case 'python':
      case 'py':
        result = await executePythonCode(code, testCase, questionId);
        break;
      default:
        return res.status(400).json({ 
          passed: false, 
          output: 'Unsupported language: ' + language
        });
    }

    return res.json(result);
  } catch (error) {
    console.error('Error executing code:', error);
    return res.status(500).json({
      passed: false,
      output: 'Error executing code: ' + error.message
    });
  }
});

// Execute Java code
async function executeJavaCode(code, testCase, questionId) {
  console.log("Executing Java code");
  
  // Create unique filenames to prevent collisions
  const timestamp = Date.now();
  const uniqueId = Math.random().toString(36).substring(2, 8);
  const solutionFileName = `Solution_${uniqueId}_${timestamp}.java`;
  const testRunnerFileName = `TestRunner_${uniqueId}_${timestamp}.java`;
  
  const solutionFilePath = path.join(javaDir, solutionFileName);
  const testRunnerFilePath = path.join(javaDir, testRunnerFileName);
  
  try {
    // Parse the input
    const inputStr = testCase.input ? testCase.input.trim() : "";
    const expectedOutput = testCase.expectedOutput ? testCase.expectedOutput.trim() : "";
    
    console.log("Java input:", inputStr);
    console.log("Java expected output:", expectedOutput);
    
    // Prepare the code - ensure it has a Solution class with solution method
    let processedCode = code;
    
    // Check if the code already has a Solution class declaration
    if (!processedCode.includes("public class Solution")) {
      // Wrap the code in a Solution class if it doesn't have one
      processedCode = `public class Solution {
${processedCode}
}`;
    }
    
    // Write the Solution class to a file
    fs.writeFileSync(solutionFilePath, processedCode);
    
    // Create a test runner that imports the Solution class
    const testRunnerCode = `
import java.util.*;

public class TestRunner_${uniqueId}_${timestamp} {
    public static void main(String[] args) {
        try {
            // Parse input arguments
            String[] inputs = "${inputStr}".trim().split("\\\\s+");
            if (inputs.length >= 2) {
                int a = Integer.parseInt(inputs[0]);
                int b = Integer.parseInt(inputs[1]);
                
                // Call the solution method
                int result = Solution.solution(a, b);
                
                // Print only the result
                System.out.println(result);
            } else {
                System.err.println("Error: Not enough input arguments");
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}`;

    fs.writeFileSync(testRunnerFilePath, testRunnerCode);
    
    // Compile both files - use Windows-compatible command syntax
    console.log("Compiling Java files");
    try {
      // Use a command that works in Windows cmd
      await execPromise(`cmd /c javac -d "${javaDir}" "${solutionFilePath}" "${testRunnerFilePath}"`);
    } catch (compileError) {
      console.error("Java compilation error:", compileError);
      return {
        passed: false,
        output: `Compilation error: ${compileError.message || compileError}`,
        expected: expectedOutput,
        input: inputStr
      };
    }
    
    // Run the test - use Windows-compatible command syntax
    console.log("Running Java test");
    const { stdout, stderr } = await execPromise(`cmd /c java -cp "${javaDir}" TestRunner_${uniqueId}_${timestamp}`);
    
    // Get the output
    const output = stdout.trim();
    console.log("Java output:", output);
    if (stderr) {
      console.error("Java stderr:", stderr);
    }
    
    // Cleanup
    try {
      fs.unlinkSync(solutionFilePath);
      fs.unlinkSync(testRunnerFilePath);
      fs.unlinkSync(path.join(javaDir, `Solution.class`));
      fs.unlinkSync(path.join(javaDir, `TestRunner_${uniqueId}_${timestamp}.class`));
    } catch (error) {
      console.error("Error cleaning up Java files:", error);
    }
    
    // Compare the output with the expected output
    const passed = output === expectedOutput;
    
    return {
      passed,
      output: output,
      expected: expectedOutput,
      input: testCase.input
    };
  } catch (error) {
    console.error("Java execution error:", error);
    
    // Cleanup any files that might have been created
    try {
      if (fs.existsSync(solutionFilePath)) fs.unlinkSync(solutionFilePath);
      if (fs.existsSync(testRunnerFilePath)) fs.unlinkSync(testRunnerFilePath);
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }
    
    return {
      passed: false,
      output: error.stderr || error.stdout || error.message || "Unknown error occurred",
      expected: testCase.expectedOutput,
      input: testCase.input
    };
  }
}

// Execute JavaScript code
async function executeJavaScriptCode(code, testCase, questionId) {
  const fileName = `solution_${questionId.slice(-5)}_${Date.now()}.js`;
  const filePath = path.join(jsDir, fileName);
  
  try {
    // Clean and prepare the input based on expected format
    const input = testCase.input.replace(/"/g, '\\"');
    const expectedOutput = testCase.expectedOutput.trim();
    
    // Determine how to call the solution function based on the problem type
    const testCode = `
      ${code}
      
      // Test with the provided input
      const input = "${input}";
      let result;
      
      // Try different possible function names
      if (typeof solution === 'function') {
        result = solution(input);
      } else if (typeof main === 'function') {
        result = main(input);
      } else {
        // If no function is found, try to extract a function from the code
        // This is a fallback for code that doesn't explicitly define a function
        const functionMatch = /function\\s+([a-zA-Z0-9_]+)\\s*\\(/.exec(code);
        if (functionMatch && typeof eval(functionMatch[1]) === 'function') {
          result = eval(functionMatch[1])(input);
        } else {
          console.error('No solution function found');
          result = 'No solution function found';
        }
      }
      
      console.log(result);
    `;
    
    // Create a temporary JS file
    fs.writeFileSync(filePath, testCode);
    
    // Execute the JavaScript code using Node.js
    const { stdout, stderr } = await execPromise(`cmd /c node "${filePath}"`);
    
    // Process the output
    const output = stdout.trim();
    
    // Cleanup
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Error cleaning up JavaScript file:', error);
    }
    
    // Compare output with expected output
    const passed = output === expectedOutput;
    
    return {
      passed,
      output: output,
      expected: expectedOutput,
      input: testCase.input
    };
  } catch (error) {
    console.error('JavaScript execution error:', error);
    return {
      passed: false,
      output: error.stderr || error.message,
      expected: testCase.expectedOutput,
      input: testCase.input
    };
  }
}

// Execute Python code
async function executePythonCode(code, testCase, questionId) {
  const fileName = `solution_${questionId.slice(-5)}_${Date.now()}.py`;
  const filePath = path.join(pythonDir, fileName);
  
  try {
    // Clean and prepare the input
    const input = testCase.input.replace(/"/g, '\\"');
    const expectedOutput = testCase.expectedOutput.trim();
    
    // Create test code with multiple possible function names
    const testCode = `
${code}

# Test with the provided input
input_str = """${input}"""

# Try different possible function names
if 'solution' in locals() or 'solution' in globals():
    result = solution(input_str)
elif 'main' in locals() or 'main' in globals():
    result = main(input_str)
else:
    # Look for a function definition in the code
    import re
    import inspect
    
    function_match = re.search(r'def\\s+([a-zA-Z0-9_]+)\\s*\\(', code)
    if function_match:
        func_name = function_match.group(1)
        if func_name in locals() or func_name in globals():
            result = eval(f"{func_name}(input_str)")
        else:
            result = "Function found but couldn't be called"
    else:
        result = "No solution function found"

print(result)
`;
    
    // Create a temporary Python file
    fs.writeFileSync(filePath, testCode);
    
    // Execute the Python code
    const { stdout, stderr } = await execPromise(`cmd /c python "${filePath}"`);
    
    // Process the output
    const output = stdout.trim();
    
    // Cleanup
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Error cleaning up Python file:', error);
    }
    
    // Compare output with expected output
    const passed = output === expectedOutput;
    
    return {
      passed,
      output: output,
      expected: expectedOutput,
      input: testCase.input
    };
  } catch (error) {
    console.error('Python execution error:', error);
    return {
      passed: false,
      output: error.stderr || error.message,
      expected: testCase.expectedOutput,
      input: testCase.input
    };
  }
}

module.exports = router;
