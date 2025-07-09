import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Editor from "@monaco-editor/react";
import {
  FaPlay,
  FaCheck,
  FaTimes,
  FaClock,
  FaCode,
  FaLightbulb,
} from "react-icons/fa";

const CodingTest = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [submissionResults, setSubmissionResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [activeTab, setActiveTab] = useState("description");

  const languages = [
    { value: "javascript", label: "JavaScript", monacoLang: "javascript" },
    { value: "python", label: "Python", monacoLang: "python" },
    { value: "java", label: "Java", monacoLang: "java" },
    { value: "cpp", label: "C++", monacoLang: "cpp" },
  ];

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (selectedQuestion && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [selectedQuestion, timeLeft]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/coding`
      );
      setQuestions(response.data.questions);
    } catch (error) {
      console.error("Error fetching coding questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectQuestion = async (questionId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/coding/${questionId}`
      );
      const question = response.data;

      setSelectedQuestion(question);
      setCode(question.starterCode || getDefaultCode(language));
      setTimeLeft(question.timeLimit * 60); // Convert minutes to seconds
      setTestResults([]);
      setSubmissionResults(null);
    } catch (error) {
      console.error("Error fetching question details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultCode = (lang) => {
    const templates = {
      javascript: `function solution(input) {
  // Your code here
  return result;
}`,
      python: `def solution(input):
    # Your code here
    return result`,
      java: `public class Solution {
    public static String solution(String input) {
        // Your code here
        return result;
    }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

string solution(string input) {
    // Your code here
    return result;
}`,
    };
    return templates[lang] || templates.javascript;
  };

  const runCode = async (testCaseIndex = 0) => {
    if (!selectedQuestion) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/coding/execute`,
        {
          code,
          language: language,
          questionId: selectedQuestion._id,
          testCaseIndex,
        }
      );

      setTestResults((prev) => {
        const newResults = [...prev];
        newResults[testCaseIndex] = response.data;
        return newResults;
      });
    } catch (error) {
      console.error("Error running code:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async () => {
    if (!selectedQuestion) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/coding/submit`,
        {
          code,
          language,
          questionId: selectedQuestion._id,
        }
      );

      setSubmissionResults(response.data);
    } catch (error) {
      console.error("Error submitting code:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  if (!selectedQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              <FaCode className="inline mr-4" />
              Coding <span className="text-purple-400">Challenges</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Test your programming skills with real coding problems
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {questions.map((question, index) => (
                <motion.div
                  key={question._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer group"
                  onClick={() => selectQuestion(question._id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                      {question.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-sm font-semibold ${getDifficultyColor(
                        question.difficulty
                      )}`}
                    >
                      {question.difficulty}
                    </span>
                  </div>

                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {question.description.substring(0, 150)}...
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags?.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>{question.language}</span>
                    <span className="flex items-center">
                      <FaClock className="mr-1" />
                      {question.timeLimit} min
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedQuestion(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Problems
            </button>
            <h1 className="text-xl font-bold">{selectedQuestion.title}</h1>
            <span
              className={`px-2 py-1 rounded text-sm ${getDifficultyColor(
                selectedQuestion.difficulty
              )}`}
            >
              {selectedQuestion.difficulty}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {timeLeft !== null && (
              <div
                className={`flex items-center space-x-2 ${
                  timeLeft < 300 ? "text-red-400" : "text-green-400"
                }`}
              >
                <FaClock />
                <span className="font-mono text-lg">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}

            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setCode(getDefaultCode(e.target.value));
              }}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r border-gray-700 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-4 py-2 font-medium ${
                activeTab === "description"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("testcases")}
              className={`px-4 py-2 font-medium ${
                activeTab === "testcases"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Test Cases
            </button>
            <button
              onClick={() => setActiveTab("results")}
              className={`px-4 py-2 font-medium ${
                activeTab === "results"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Results
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "description" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    {selectedQuestion.title}
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: selectedQuestion.description.replace(
                          /\n/g,
                          "<br>"
                        ),
                      }}
                    />
                  </div>
                </div>

                {selectedQuestion.constraints && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <FaLightbulb className="mr-2 text-yellow-400" />
                      Constraints
                    </h3>
                    <div className="bg-gray-800 p-4 rounded">
                      <pre className="text-sm text-gray-300">
                        {selectedQuestion.constraints}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "testcases" && (
              <div className="space-y-4">
                {selectedQuestion.testCases?.map((testCase, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">Test Case {index + 1}</h4>
                      <button
                        onClick={() => runCode(index)}
                        disabled={loading}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm flex items-center space-x-1"
                      >
                        <FaPlay className="text-xs" />
                        <span>Run</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-400 text-sm">Input:</span>
                        <pre className="bg-gray-900 p-2 rounded mt-1 text-sm">
                          {testCase.input}
                        </pre>
                      </div>
                      {!testCase.isHidden && (
                        <div>
                          <span className="text-gray-400 text-sm">
                            Expected Output:
                          </span>
                          <pre className="bg-gray-900 p-2 rounded mt-1 text-sm">
                            {testCase.expectedOutput}
                          </pre>
                        </div>
                      )}
                      {testResults[index] && (
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-gray-400 text-sm">
                              Your Output:
                            </span>
                            {testResults[index].passed ? (
                              <FaCheck className="text-green-400 text-sm" />
                            ) : (
                              <FaTimes className="text-red-400 text-sm" />
                            )}
                          </div>
                          <pre
                            className={`p-2 rounded mt-1 text-sm ${
                              testResults[index].passed
                                ? "bg-green-900/20"
                                : "bg-red-900/20"
                            }`}
                          >
                            {testResults[index].output}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "results" && submissionResults && (
              <div className="space-y-4">
                <div className="bg-gray-800 p-6 rounded">
                  <h3 className="text-xl font-bold mb-4">Submission Results</h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {submissionResults.passedTests}
                      </div>
                      <div className="text-sm text-gray-400">Passed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {submissionResults.totalTests -
                          submissionResults.passedTests}
                      </div>
                      <div className="text-sm text-gray-400">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {submissionResults.score.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">Score</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {submissionResults.results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded ${
                        result.passed ? "bg-green-900/20" : "bg-red-900/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          Test Case {result.testCase}
                        </span>
                        {result.passed ? (
                          <FaCheck className="text-green-400" />
                        ) : (
                          <FaTimes className="text-red-400" />
                        )}
                      </div>
                      {!result.passed && result.error && (
                        <div className="mt-2 text-sm text-red-300">
                          Error: {result.output}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={
                languages.find((l) => l.value === language)?.monacoLang ||
                "javascript"
              }
              value={code}
              onChange={setCode}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-700 p-4 flex justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => runCode(0)}
                disabled={loading || !selectedQuestion.testCases?.length}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded flex items-center space-x-2"
              >
                <FaPlay />
                <span>Run Code</span>
              </button>
            </div>

            <button
              onClick={submitCode}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded font-semibold"
            >
              {loading ? "Submitting..." : "Submit Solution"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingTest;
