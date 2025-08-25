import React, { useEffect, useRef, useState } from 'react';
import { CodeJar } from 'codejar';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CodeEditor = ({ 
  questionId, 
  language, 
  initialCode = '', 
  onTestResults,
  testCases = [] 
}) => {
  const editorRef = useRef(null);
  const jarRef = useRef(null);
  const [code, setCode] = useState(initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [score, setScore] = useState(0);

  // CodeJar options
  const options = {
    tab: ' '.repeat(4),
    indentOn: /[({\[]$/,
    moveToNewLine: /^[)}\]]$/,
    spellcheck: false,
    catchTab: true,
    preserveIdent: true,
    addClosing: true,
    history: true,
    autoclose: {
      open: '([{\'"`',
      close: ')]}\'"`'
    }
  };

  // Syntax highlighting function
  const highlight = editor => {
    const code = editor.textContent;
    editor.innerHTML = Prism.highlight(
      code,
      Prism.languages[language.toLowerCase()],
      language.toLowerCase()
    );
  };

  useEffect(() => {
    // Initialize CodeJar
    if (editorRef.current && !jarRef.current) {
      jarRef.current = CodeJar(editorRef.current, highlight, options);
      
      // Set up onChange handler
      jarRef.current.onUpdate(code => {
        setCode(code);
      });
    }

    // Cleanup
    return () => {
      if (jarRef.current) {
        jarRef.current.destroy();
        jarRef.current = null;
      }
    };
  }, []);

  // Run a single test case
  const runTestCase = async (testCaseIndex) => {
    try {
      setIsRunning(true);
      const response = await axios.post(`${API_BASE_URL}/api/code/execute`, {
        code,
        language,
        questionId,
        testCaseIndex
      });

      return response.data;
    } catch (error) {
      console.error('Error running test case:', error);
      return {
        passed: false,
        output: error.message,
        error: true
      };
    }
  };

  // Run all test cases and calculate score
  const runAllTests = async () => {
    setIsRunning(true);
    const results = [];
    let passedCount = 0;

    try {
      for (let i = 0; i < testCases.length; i++) {
        const result = await runTestCase(i);
        results.push({
          ...result,
          testCaseIndex: i,
          isHidden: testCases[i].isHidden
        });

        if (result.passed) {
          passedCount++;
        }
      }

      // Calculate score as percentage of passed tests
      const newScore = (passedCount / testCases.length) * 100;
      setScore(newScore);
      setTestResults(results);

      // Notify parent component
      if (onTestResults) {
        onTestResults({
          results,
          score: newScore,
          passedCount,
          totalTests: testCases.length
        });
      }
    } catch (error) {
      console.error('Error running all tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getLanguageClassName = () => {
    const languageMap = {
      'javascript': 'language-javascript',
      'python': 'language-python',
      'java': 'language-java'
    };
    return languageMap[language.toLowerCase()] || 'language-javascript';
  };

  return (
    <div className="w-full space-y-4">
      {/* Editor Container */}
      <div className="relative rounded-lg border border-gray-700 bg-gray-900">
        {/* Language Badge */}
        <div className="absolute right-2 top-2 px-2 py-1 rounded bg-gray-700 text-xs text-white">
          {language}
        </div>
        
        {/* CodeJar Editor */}
        <pre className={`p-4 focus:outline-none ${getLanguageClassName()}`}>
          <code ref={editorRef} className="block whitespace-pre overflow-x-auto">
            {initialCode}
          </code>
        </pre>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isRunning 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </button>

        {score > 0 && (
          <div className="text-white">
            Score: {score.toFixed(0)}%
          </div>
        )}
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded-md ${
                result.passed ? 'bg-green-900/50' : 'bg-red-900/50'
              }`}
            >
              <div className="flex justify-between items-center text-sm text-white">
                <span>
                  Test Case {index + 1}:
                  {result.isHidden ? ' (Hidden)' : ''}
                </span>
                <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                  {result.passed ? 'Passed ✓' : 'Failed ✗'}
                </span>
              </div>
              {!result.isHidden && (
                <div className="mt-2 text-xs">
                  <div className="text-gray-300">Input: {result.input}</div>
                  <div className="text-gray-300">Expected: {result.expected}</div>
                  <div className="text-gray-300">Output: {result.output}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
