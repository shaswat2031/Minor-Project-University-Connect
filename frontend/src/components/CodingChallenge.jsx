import { useState } from 'react';
import Editor from '@monaco-editor/react';
import PropTypes from 'prop-types';
import { executeCode } from '../services/judge0Service';

const CodingChallenge = ({ question, onTestCasePass }) => {
  const editorRef = useRef(null);
  const jarRef = useRef(null);
  const [code, setCode] = useState(question.starterCode || '');
  const [testResults, setTestResults] = useState([]);
  const [runningTest, setRunningTest] = useState(false);
  const [score, setScore] = useState(0);
  const [passedTests, setPassedTests] = useState(0);
  
  const pointsPerTest = Math.floor(100 / (question.testCases?.length || 1));

  // Handler for running a single test case
  const runTestCase = async (testCaseIndex) => {
    try {
      const response = await axios.post('/api/code/execute', {
        code,
        language: question.language,
        questionId: question._id,
        input: question.testCases[testCaseIndex].input
      });

      return response.data;
    } catch (error) {
      console.error('Error running test case:', error);
      return { success: false, error: error.message };
    }
  };

  // Handler for running all test cases
  const runAllTests = async () => {
    setRunningTest(true);
    let newPassedTests = 0;
    const results = [];

    try {
      for (let i = 0; i < question.testCases.length; i++) {
        const result = await runTestCase(i);
        results.push(result);
        if (result.success) newPassedTests++;
      }

      const finalScore = newPassedTests * pointsPerTest;
      setScore(finalScore);
      setPassedTests(newPassedTests);
      setTestResults(results);

      if (newPassedTests > 0) {
        onTestCasePass(finalScore);
      }
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setRunningTest(false);
    }
  };

  // Calculate points per test case
  const pointsPerTest = Math.floor(100 / (question.testCases?.length || 1));

  // Handler for running a single test case
  const runTestCase = async (testCaseIndex) => {
    try {
      const response = await axios.post('/api/code/execute', {
        code,
        language: question.language,
        questionId: question._id,
        input: question.testCases[testCaseIndex].input
      });

      return response.data;
    } catch (error) {
      console.error('Error running test case:', error);
      return { success: false, error: error.message };
    }
  };

  // Handler for running all test cases
  const runAllTests = async () => {
    setRunningTest(true);
    let newPassedTests = 0;
    const results = [];

    try {
      for (let i = 0; i < question.testCases.length; i++) {
        const result = await runTestCase(i);
        results.push(result);
        if (result.success) newPassedTests++;
      }

      const finalScore = newPassedTests * pointsPerTest;
      setScore(finalScore);
      setPassedTests(newPassedTests);
      setTestResults(results);

      if (newPassedTests > 0) {
        onTestCasePass(finalScore);
      }
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setRunningTest(false);
    }
  };

  useEffect(() => {
    const highlightCode = (editor) => {
      const code = editor.textContent;
      editor.innerHTML = Prism.highlight(
        code,
        Prism.languages[question.language.toLowerCase()],
        question.language.toLowerCase()
      );
    };

    if (editorRef.current && !jarRef.current) {
      jarRef.current = CodeJar(editorRef.current, highlightCode);
      jarRef.current.updateCode(code);
      jarRef.current.onUpdate(newCode => setCode(newCode));
    }

    return () => {
      if (jarRef.current) {
        jarRef.current.destroy();
        jarRef.current = null;
      }
    };
  }, [code, question.language]);

  return (
    <div className="p-4">
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{question.title}</h3>
        <p className="text-gray-300 mb-4">{question.description}</p>
        {question.constraints && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-white mb-2">Constraints:</h4>
            <pre className="text-gray-300">{question.constraints}</pre>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div
          ref={editorRef}
          className="h-96 p-4 bg-gray-900 rounded-lg text-white font-mono text-sm overflow-auto"
          style={{ outline: 'none' }}
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={runAllTests}
          disabled={runningTest}
          className={`px-6 py-2 rounded-lg font-semibold ${
            runningTest
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {runningTest ? 'Running Tests...' : 'Run All Tests'}
        </button>
        <div className="text-white">
          Score: {score}/100 ({passedTests}/{question.testCases.length} tests passed)
        </div>
      </div>

      {testResults.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Test Results:</h4>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  result.success ? 'bg-green-800' : 'bg-red-800'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">
                    Test Case {index + 1}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.success ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  >
                    {result.success ? 'Passed' : 'Failed'}
                  </span>
                </div>
                {!result.success && result.error && (
                  <div className="text-red-300 mb-2">{result.error}</div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Input:</p>
                    <pre className="text-gray-300 bg-gray-700 p-2 rounded">
                      {question.testCases[index].input}
                    </pre>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Expected Output:</p>
                    <pre className="text-gray-300 bg-gray-700 p-2 rounded">
                      {question.testCases[index].output}
                    </pre>
                  </div>
                  {result.output && (
                    <div className="col-span-2">
                      <p className="text-gray-400 text-sm mb-1">Your Output:</p>
                      <pre className="text-gray-300 bg-gray-700 p-2 rounded">
                        {result.output}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

CodingChallenge.propTypes = {
  question: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    starterCode: PropTypes.string,
    language: PropTypes.string.isRequired,
    constraints: PropTypes.string,
    testCases: PropTypes.arrayOf(
      PropTypes.shape({
        input: PropTypes.string.isRequired,
        output: PropTypes.string.isRequired
      })
    ).isRequired
  }).isRequired,
  onTestCasePass: PropTypes.func.isRequired
};

export default CodingChallenge;

  // CodeJar options
  const options = {
    tab: ' '.repeat(4),
    indentOn: /[({[]$/,
    moveToNewLine: /^[)}\]]$/,
    spellcheck: false,
    catchTab: true,
    preserveIdent: true,
    addClosing: true,
    history: true,
    autoclose: {
      open: '([{\'"```',
      close: ')]}\'"```'
    }
  };

  // Syntax highlighting function
  const highlight = editor => {
    const code = editor.textContent;
    editor.innerHTML = Prism.highlight(
      code,
      Prism.languages[question.language.toLowerCase()],
      question.language.toLowerCase()
    );
  };

  // Initialize CodeJar
  useEffect(() => {
    if (editorRef.current && !jarRef.current) {
      jarRef.current = CodeJar(editorRef.current, highlight, options);
      
      // Set initial code
      jarRef.current.updateCode(code);
      
      // Set up onChange handler
      jarRef.current.onUpdate(newCode => {
        setCode(newCode);
      });
    }

    return () => {
      if (jarRef.current) {
        jarRef.current.destroy();
        jarRef.current = null;
      }
    };
  }, [code, question.language]);

  const runTestCase = async (testCaseIndex) => {
    setRunningTest(true);
    try {
      const response = await axios.post('/api/coding/execute', {
        code,
        language: question.language,
        questionId: question._id,
        testCaseIndex
      });

      const result = response.data;
      
      // Update test results
      setTestResults(prev => {
        const newResults = [...prev];
        newResults[testCaseIndex] = {
          passed: result.passed,
          output: result.output,
          expected: result.expected,
          input: result.input
        };
        return newResults;
      });

      // Calculate new score and update passed tests count
      if (result.passed) {
        const newPassedTests = passedTests + 1;
        const newScore = newPassedTests * pointsPerTest;
        setPassedTests(newPassedTests);
        setScore(newScore);
        onTestCasePass(newScore, newPassedTests);
      }

      return result.passed;
    } catch (error) {
      console.error('Error running test case:', error);
      setTestResults(prev => {
        const newResults = [...prev];
        newResults[testCaseIndex] = {
          passed: false,
          output: 'Error: ' + (error.response?.data?.message || error.message),
          expected: 'Test failed to run',
          input: question.testCases[testCaseIndex].input
        };
        return newResults;
      });
      return false;
    } finally {
      setRunningTest(false);
    }
  };

  const runAllTests = async () => {
    setRunningTest(true);
    setTestResults([]);
    setScore(0);
    setPassedTests(0);

    let allPassed = true;
    let newPassedTests = 0;

    for (let i = 0; i < question.testCases.length; i++) {
      const passed = await runTestCase(i);
      if (passed) {
        newPassedTests++;
      } else {
        allPassed = false;
      }
    }

    // Update final score
    const finalScore = newPassedTests * pointsPerTest;
    setScore(finalScore);
    setPassedTests(newPassedTests);
    onTestCasePass(finalScore, newPassedTests);

    setRunningTest(false);
    return allPassed;
  };

  return (
    <div className="coding-challenge bg-gray-900 p-4 rounded-lg">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">{question.title}</h3>
        <p className="text-gray-300 mb-4">{question.description}</p>
        <div className="constraints text-yellow-400 text-sm mb-4">
          <p>Constraints:</p>
          <pre>{question.constraints}</pre>
        </div>
      </div>

      <div className="editor-container mb-4">
        <CodeEditor
          code={code}
          onChange={handleCodeChange}
          language={question.language}
        />
      </div>

      <div className="test-controls flex gap-4 mb-4">
        <button
          onClick={runAllTests}
          disabled={runningTest}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {runningTest ? 'Running Tests...' : 'Run All Tests'}
        </button>
        <div className="score-display text-white">
          Score: {score}/100 ({passedTests}/{question.testCases.length} tests passed)
        </div>
      </div>

      <div className="test-results">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`test-case p-4 mb-2 rounded-lg ${
              result?.passed ? 'bg-green-800' : 'bg-red-800'
            }`}
          >
            <div className="flex justify-between mb-2">
              <span className="text-white">Test Case {index + 1}</span>
              <span className={result?.passed ? 'text-green-400' : 'text-red-400'}>
                {result?.passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Input:</p>
                <pre className="text-white bg-gray-800 p-2 rounded">
                  {result?.input || question.testCases[index].input}
                </pre>
              </div>
              <div>
                <p className="text-gray-400">Expected Output:</p>
                <pre className="text-white bg-gray-800 p-2 rounded">
                  {result?.expected || question.testCases[index].expectedOutput}
                </pre>
              </div>
              {result?.output && (
                <div className="col-span-2">
                  <p className="text-gray-400">Your Output:</p>
                  <pre className="text-white bg-gray-800 p-2 rounded">
                    {result.output}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodingChallenge;
