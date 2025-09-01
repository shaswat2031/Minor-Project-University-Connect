import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import PropTypes from 'prop-types';
import { FaExclamationTriangle, FaDownload, FaCode, FaPlay, FaQuestionCircle, FaCheck, FaTimes, FaLightbulb, FaClock, FaMemory } from "react-icons/fa";
import axios from "axios";
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import {
  fetchUserProfile,
} from "../api/certification";
import { executeCodingTest, runAllTestCases } from "../api/codingService";
import jsPDF from "jspdf";
import Confetti from "react-confetti";
import "../styles/anticheat.css";

import { useToast } from "../components/Toast";
import AntiCheatWrapper from "../components/AntiCheatWrapper";

// Define styles for the certificate
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    width: '842pt',  // A4 landscape width
    height: '595pt'  // A4 landscape height
  },
  border: {
    position: 'absolute',
    top: 25,
    left: 25,
    right: 25,
    bottom: 25,
    borderColor: '#C4A962',
    borderWidth: 2,
    borderStyle: 'solid',
    borderRadius: 2
  },
  innerBorder: {
    position: 'absolute',
    top: 35,
    left: 35,
    right: 35,
    bottom: 35,
    borderColor: '#C4A962',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 1
  },
  decorator: {
    fontSize: 20,
    textAlign: 'center',
    color: '#C4A962',
    marginVertical: 5,
    fontFamily: 'Times-Roman'
  },
  header: {
    fontSize: 38,
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 0,
    color: '#C4A962',
    fontFamily: 'Times-Bold',
    letterSpacing: 2
  },
  subHeader: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666666',
    fontFamily: 'Times-Roman',
    letterSpacing: 1,
  },
  content: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 1.4,
    textAlign: 'center',
    color: '#2D3748',
  },
  name: {
    fontSize: 36,
    textAlign: 'center',
    marginVertical: 15,
    color: '#C4A962',
    fontFamily: 'Times-Roman',
    fontStyle: 'italic',
  },
  score: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    color: '#4A5568',
    fontFamily: 'Times-Bold',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingHorizontal: 100,
  },
  dateLabel: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#C4A962',
    paddingTop: 5,
    width: 150,
  },
  signature: {
    fontSize: 32,
    textAlign: 'center',
    color: '#C4A962',
    fontFamily: 'Times-Roman',
    marginTop: 20,
    letterSpacing: 1,
    fontStyle: 'italic',
  },
  certId: {
    position: 'absolute',
    bottom: 30,
    right: 35,
    fontSize: 10,
    color: '#718096',
  },
  decoratorBottom: {
    fontSize: 24,
    color: '#C4A962',
    textAlign: 'center',
    marginVertical: 10,
  }
});

// Certificate Document Component
const CertificateDocument = ({ name, result, category }) => {
  CertificateDocument.propTypes = {
    name: PropTypes.string.isRequired,
    result: PropTypes.shape({
      score: PropTypes.number.isRequired,
      totalQuestions: PropTypes.number.isRequired,
      id: PropTypes.string
    }).isRequired,
    category: PropTypes.string.isRequired
  };

  const currentDate = format(new Date(), 'MMMM dd, yyyy');
  const certificateId = result.id || Math.random().toString(36).substr(2, 9);

  
  return (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      {/* Decorative Borders */}
      <View style={styles.border} />
      <View style={styles.innerBorder} />
      
      {/* Certificate Header */}
      <Text style={styles.header}>CERTIFICATE</Text>
      <Text style={styles.subHeader}>OF COMPLETION</Text>

      {/* Main Content */}
      <View style={styles.content}>
        <Text>This is to certify that</Text>
        <Text style={styles.name}>{name}</Text>
        <Text>
          has successfully completed the {category} certification examination
          with distinction, achieving
        </Text>
        <Text style={styles.score}>
          {result.score} out of {result.totalQuestions} ({((result.score/result.totalQuestions) * 100).toFixed(1)}%)
        </Text>
      </View>

      {/* Date and Signature Section */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>{currentDate}</Text>
        <Text style={styles.dateLabel}>Signature</Text>
      </View>

      {/* Signature */}
      <Text style={styles.signature}>UniConnect</Text>
      <Text style={[styles.content, { fontSize: 12, marginTop: 8, color: '#666666' }]}>
        CEO, University Connect
      </Text>

      {/* Certificate ID */}
      <Text style={styles.certId}>
        Certificate ID: {certificateId}
      </Text>


    </Page>
  </Document>
  );
};

const Certifications = () => {
  const { success, error, warning, info } = useToast();
  
  // Question-related state
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Exam state
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
  const [examStarted, setExamStarted] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Results and validation
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [codingTestResults, setCodingTestResults] = useState({});
  const [codingValidationStatus, setCodingValidationStatus] = useState({});
  const [allTestsRun, setAllTestsRun] = useState(false);
  
  // UI state
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNameConfirmation, setShowNameConfirmation] = useState(false);
  const [showTestDetails, setShowTestDetails] = useState(true);
  
  // Certificate state
  const [certificateName, setCertificateName] = useState("");
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [certificateDownloaded, setCertificateDownloaded] = useState(false);
  
  // Anti-cheat state
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  
  // Show warning message when copy/paste is attempted
  const showCopyPasteWarning = useCallback((action) => {
    setWarningMessage(`${action} is not allowed during certification tests!`);
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 3000);
  }, []);
  
  // Enhanced code editor state
  const [syntaxHighlighting, setSyntaxHighlighting] = useState(true);
  const [questionLanguages, setQuestionLanguages] = useState({}); // Track language for each question
  
  // State organization moved to top of component
  
  // Validation functions
  const validateAnswers = () => {
    const unansweredMCQ = questions.some((q, index) => 
      q.type === 'mcq' && (!answers[index] || answers[index].trim() === '')
    );
    
    const unvalidatedCoding = questions.some((q, index) => 
      q.type === 'coding' && !codingValidationStatus[index]
    );

    if (unansweredMCQ) {
      return { valid: false, message: 'Please answer all multiple choice questions' };
    }
    
    if (unvalidatedCoding) {
      return { valid: false, message: 'Please run and pass all coding test cases' };
    }

    return { valid: true };
  };

  // Check if all tests are passing whenever codingValidationStatus changes
  useEffect(() => {
    if (questions.length > 0) {
      const codingQuestions = questions.filter(q => q.type === "coding");
      const allCodingValidated = codingQuestions.every((q, index) => {
        const questionIndex = questions.findIndex(quest => quest._id === q._id);
        return codingValidationStatus[questionIndex];
      });
      setAllTestsRun(allCodingValidated);
    }
  }, [codingValidationStatus, questions]);

  // Enhanced Code Editor Functions (from CodeRunner)
  const handleCodeEditorKeyDown = (e, textarea) => {
    // Don't interfere with normal typing for most keys
    const specialKeys = ['Enter', 'Tab', '(', '[', '{', '"', "'", ')', ']', '}'];
    if (!specialKeys.includes(e.key) && !(e.ctrlKey && e.key === 'Enter')) {
      return; // Let normal typing flow through
    }

    const { selectionStart, selectionEnd, value } = textarea;
    
    // Auto brackets and quotes
    const bracketPairs = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'"
    };

    // Handle bracket/quote auto-completion
    if (bracketPairs[e.key] && selectionStart === selectionEnd) {
      e.preventDefault();
      const before = value.substring(0, selectionStart);
      const after = value.substring(selectionEnd);
      
      // For quotes, check if we should close existing quote
      if ((e.key === '"' || e.key === "'") && 
          after.charAt(0) === e.key) {
        // Move cursor past existing quote
        setTimeout(() => {
          textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
        }, 0);
        return;
      }
      
      const newValue = before + e.key + bracketPairs[e.key] + after;
      
      // Update using React state instead of direct manipulation
      handleCodingAnswerWithFeatures(newValue);
      
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
      }, 0);
      return;
    }

    // Handle closing brackets - skip if next char is the closing bracket
    const closingBrackets = [')', ']', '}'];
    if (closingBrackets.includes(e.key) && 
        value.charAt(selectionStart) === e.key) {
      e.preventDefault();
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
      }, 0);
      return;
    }

    // Enhanced Enter key handling for auto-indentation
    if (e.key === 'Enter') {
      e.preventDefault();
      const before = value.substring(0, selectionStart);
      const after = value.substring(selectionEnd);
      const lines = before.split('\n');
      const currentLine = lines[lines.length - 1];
      
      // Calculate indentation
      const indentMatch = currentLine.match(/^(\s*)/);
      let indent = indentMatch ? indentMatch[1] : '';
      
      // Add extra indentation for opening brackets
      const lastChar = before.trim().slice(-1);
      if (['{', '(', '['].includes(lastChar)) {
        indent += '    '; // 4 spaces
      }
      
      // Check if we need to add closing bracket on next line
      const needsClosingBracket = lastChar === '{' && 
        !after.trimLeft().startsWith('}');
      
      let newValue;
      let newCursorPos;
      
      if (needsClosingBracket) {
        const closingIndent = indent.substring(4); // Remove one level of indentation
        newValue = before + '\n' + indent + '\n' + closingIndent + '}' + after;
        newCursorPos = before.length + 1 + indent.length;
      } else {
        newValue = before + '\n' + indent + after;
        newCursorPos = before.length + 1 + indent.length;
      }
      
      // Update using React state instead of direct manipulation
      handleCodingAnswerWithFeatures(newValue);
      
      setTimeout(() => {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
      return;
    }

    // Tab key handling (4 spaces)
    if (e.key === 'Tab') {
      e.preventDefault();
      const before = value.substring(0, selectionStart);
      const after = value.substring(selectionEnd);
      const newValue = before + '    ' + after;
      
      // Update using React state instead of direct manipulation
      handleCodingAnswerWithFeatures(newValue);
      
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 4, selectionStart + 4);
      }, 0);
      return;
    }

    // Ctrl+Enter to run test
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      runAllCodingTests(currentQuestion);
      return;
    }
  };

  const handleCodingAnswerWithFeatures = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }));
  };

  // Syntax highlighting function for certification exam
  const applySyntaxHighlighting = (code, language) => {
    if (!code || !syntaxHighlighting) return code;

    const languageKeywords = {
      JavaScript: ['function', 'var', 'let', 'const', 'if', 'else', 'for', 'while', 'return', 'class', 'extends', 'import', 'export', 'async', 'await', 'try', 'catch'],
      Python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'import', 'from', 'return', 'try', 'except', 'with', 'as', 'lambda', 'yield'],
      Java: ['public', 'private', 'static', 'class', 'interface', 'if', 'else', 'for', 'while', 'return', 'try', 'catch', 'new', 'this']
    };

    const builtins = {
      JavaScript: ['console', 'Object', 'Array', 'String', 'Number', 'Math', 'JSON', 'Promise'],
      Python: ['print', 'input', 'len', 'range', 'str', 'int', 'float', 'list', 'dict'],
      Java: ['System', 'String', 'Integer', 'Scanner', 'ArrayList', 'HashMap']
    };

    let highlightedCode = code;
    const keywords = languageKeywords[language] || [];
    const builtinFunctions = builtins[language] || [];

    // Highlight keywords (blue)
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlightedCode = highlightedCode.replace(regex, `<span style="color: #3b82f6; font-weight: bold;">${keyword}</span>`);
    });

    // Highlight built-in functions (purple)
    builtinFunctions.forEach(builtin => {
      const regex = new RegExp(`\\b${builtin}\\b`, 'g');
      highlightedCode = highlightedCode.replace(regex, `<span style="color: #8b5cf6;">${builtin}</span>`);
    });

    // Highlight strings (green)
    highlightedCode = highlightedCode.replace(/"([^"]*)"/g, '<span style="color: #10b981;">"$1"</span>');
    highlightedCode = highlightedCode.replace(/'([^']*)'/g, '<span style="color: #10b981;">\'$1\'</span>');

    // Highlight comments (gray)
    if (language === 'JavaScript' || language === 'Java') {
      highlightedCode = highlightedCode.replace(/\/\/(.*)$/gm, '<span style="color: #6b7280; font-style: italic;">//$1</span>');
    } else if (language === 'Python') {
      highlightedCode = highlightedCode.replace(/#(.*)$/gm, '<span style="color: #6b7280; font-style: italic;">#$1</span>');
    }

    return highlightedCode;
  };

  // Run single test case function
  const runSingleTestCase = async (questionIndex, testIndex) => {
    const question = questions[questionIndex];
    const testCase = question.testCases[testIndex];
    const userCode = answers[questionIndex];
    
    if (!userCode) {
      error("Please write some code before testing!");
      return;
    }

    setLoading(true);
    try {
      info(`Running test case ${testIndex + 1}...`);
      
      const language = questionLanguages[questionIndex] || question.language || "JavaScript";
      
      // Use real API instead of mock
      const result = await executeCodingTest(userCode, language, question._id, testIndex);
      
      // Update test results
      setCodingTestResults(prev => ({
        ...prev,
        [`${questionIndex}-${testIndex}`]: result
      }));
      
      if (result.passed) {
        success(`Test case ${testIndex + 1} passed! ✅`);
      } else {
        error(`Test case ${testIndex + 1} failed. Expected: ${result.expected}, Got: ${result.output}`);
      }
    } catch (err) {
      error("Error running test case: " + err.message);
      
      // Set error result
      setCodingTestResults(prev => ({
        ...prev,
        [`${questionIndex}-${testIndex}`]: {
          passed: false,
          output: err.message || "Error running test",
          expected: testCase.expectedOutput || "",
          error: true,
          status: "Error"
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  // Mock test execution function (replace with actual API call)
  const mockTestExecution = async (code, input, expectedOutput) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock result - in real implementation, this would call Judge0 API
    return {
      passed: Math.random() > 0.3, // 70% chance of passing for demo
      actualOutput: expectedOutput, // Mock output
      executionTime: "0.1s",
      memoryUsed: "2MB"
    };
  };

  // Check if all tests are passing whenever codingValidationStatus changes
  useEffect(() => {
    if (questions.length > 0) {
      const codingQuestions = questions.filter(q => q.type === "coding");
      const allCodingValidated = codingQuestions.every((q, index) => {
        const questionIndex = questions.findIndex(quest => quest._id === q._id);
        return codingValidationStatus[questionIndex];
      });
      setAllTestsRun(allCodingValidated || codingQuestions.length === 0);
    }
  }, [questions, codingValidationStatus]);

  // Force re-render syntax highlighting when language changes
  useEffect(() => {
    // This effect ensures that syntax highlighting updates when language changes
    // by triggering a re-render of the syntax highlighting overlay
  }, [questionLanguages]);

  const categories = [
    {
      id: "React",
      name: "React.js",
      description: "Test your React.js knowledge",
      icon: "⚛️",
      color: "from-blue-500 to-cyan-400",
    },
    {
      id: "Java",
      name: "Java Programming",
      description: "Core Java concepts and OOP",
      icon: "☕",
      color: "from-orange-500 to-red-500",
    },
    {
      id: "Python",
      name: "Python Programming",
      description: "Python fundamentals and syntax",
      icon: "🐍",
      color: "from-green-500 to-teal-400",
    },
    {
      id: "JavaScript",
      name: "JavaScript",
      description: "Modern JavaScript ES6+",
      icon: "🚀",
      color: "from-yellow-500 to-orange-400",
    },
    {
      id: "Data Structures",
      name: "Data Structures",
      description: "Arrays, Trees, Graphs & more",
      icon: "🏗️",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "Algorithms",
      name: "Algorithms",
      description: "Sorting, Searching & Optimization",
      icon: "🧮",
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: "Web Development",
      name: "Web Development",
      description: "HTML, CSS, and web technologies",
      icon: "🌐",
      color: "from-pink-500 to-rose-400",
    },
    {
      id: "Array",
      name: "Easy DSA - Arrays",
      description: "Array problems & algorithms",
      icon: "📊",
      color: "from-emerald-500 to-teal-400",
    },
    {
      id: "Math",
      name: "Easy DSA - Math",
      description: "Mathematical problems",
      icon: "🔢",
      color: "from-amber-500 to-orange-400",
    },
    {
      id: "Stack",
      name: "Easy DSA - Stack",
      description: "Stack data structure problems",
      icon: "📚",
      color: "from-violet-500 to-purple-400",
    },
  ];

  const questionsPerPage = 5;

  // Remove the initial useEffect that fetches questions without category
  // useEffect(() => {
  //   const fetchQuestions = async () => {
  //     try {
  //       setLoading(true);
  //       const data = await fetchCertificationQuestions();
  //       if (data && data.length > 0) {
  //         setQuestions(data);
  //       } else {
  //         console.warn("No questions available");
  //       }
  //     } catch (error) {
  //       console.error("Error:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchQuestions();
  // }, []);

  useEffect(() => {
    let interval;
    if (timeRemaining > 0 && !showResult && examStarted) {
      interval = setInterval(() => setTimeRemaining((prev) => prev - 1), 1000);
    } else if (timeRemaining === 0 && !showResult && examStarted) {
      handleSubmit();
    }
    return () => clearInterval(interval);
  }, [timeRemaining, showResult, examStarted]);

  // Fullscreen exit detection
  useEffect(() => {
    if (testStarted) {
      const handleFullScreenChange = () => {
        if (!document.fullscreenElement) {
          // User exited full-screen mode - auto submit
          handleSubmit();
        }
      };

      document.addEventListener("fullscreenchange", handleFullScreenChange);

      return () => {
        document.removeEventListener("fullscreenchange", handleFullScreenChange);
      };
    }
  }, [testStarted]);

  // Anti copy-paste protection
  useEffect(() => {
    if (testStarted) {
      const preventCopyPaste = (e) => {
        e.preventDefault();
        showCopyPasteWarning(e.type === "copy" ? "Copying" : 
                            e.type === "paste" ? "Pasting" : 
                            e.type === "cut" ? "Cutting" : "This action");
        return false;
      };
      
      const preventKeyboardShortcuts = (e) => {
        // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+P, Ctrl+S, Ctrl+A
        if (
          e.ctrlKey && 
          (e.key === 'c' || e.key === 'v' || e.key === 'x' || 
           e.key === 'p' || e.key === 's' || e.key === 'a')
        ) {
          e.preventDefault();
          showCopyPasteWarning(
            e.key === 'c' ? "Copying (Ctrl+C)" :
            e.key === 'v' ? "Pasting (Ctrl+V)" :
            e.key === 'x' ? "Cutting (Ctrl+X)" :
            e.key === 'p' ? "Printing (Ctrl+P)" :
            e.key === 's' ? "Saving (Ctrl+S)" :
            e.key === 'a' ? "Selecting all (Ctrl+A)" : "This keyboard shortcut"
          );
          return false;
        }
        
        // Prevent PrintScreen key
        if (e.key === 'PrintScreen') {
          e.preventDefault();
          showCopyPasteWarning("Screen capture");
          return false;
        }
      };
      
      const preventContextMenu = (e) => {
        e.preventDefault();
        showCopyPasteWarning("Right-click context menu");
        return false;
      };
      
      // Add event listeners
      document.addEventListener('copy', preventCopyPaste);
      document.addEventListener('paste', preventCopyPaste);
      document.addEventListener('cut', preventCopyPaste);
      document.addEventListener('keydown', preventKeyboardShortcuts);
      document.addEventListener('contextmenu', preventContextMenu);
      
      // Clean up event listeners when component unmounts
      return () => {
        document.removeEventListener('copy', preventCopyPaste);
        document.removeEventListener('paste', preventCopyPaste);
        document.removeEventListener('cut', preventCopyPaste);
        document.removeEventListener('keydown', preventKeyboardShortcuts);
        document.removeEventListener('contextmenu', preventContextMenu);
      };
    }
  }, [testStarted, showCopyPasteWarning]);

  // Updated fetchQuestions function to get mixed MCQ and coding questions
  const fetchQuestions = async (category) => {
    setLoading(true);
    try {
      console.log("Fetching questions for category:", category);

      // Check if user is authenticated or use demo mode
      let token = localStorage.getItem("token");
      
      if (!token) {
        // For demo purposes, use test token
        console.log("No token found, using test token for demo");
        token = "test-token-for-submission";
        // Set temporary demo user data
        localStorage.setItem("token", token);
        localStorage.setItem("userId", "test-user-123");
        localStorage.setItem("userName", "Demo User");
        info("Running in demo mode - no login required");
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/certifications/questions`, 
        {
          params: { category },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Questions received:", response.data);

      if (!response.data || response.data.length === 0) {
        warning(
          `No questions available for ${category}. Please contact admin to add questions.`
        );
        setSelectedCategory(""); // Go back to category selection
        return null; // Return null to indicate no questions
      }

      setQuestions(response.data);
      setAnswers({}); // Reset answers as object
      setCurrentQuestion(0);
      setTimeRemaining(1800); // Reset timer to 30 minutes
      setExamStarted(true);
      // Note: setTestStarted will be called from agreeToStartTest function
      
      return response.data; // Return the questions for calling function
    } catch (error) {
      console.error("Error fetching questions:", error);

      // More detailed error handling
      if (error.response) {
        // Handle specific error cases
        if (error.response.status === 401) {
          warning("Authentication failed. Trying demo mode...");
          // Clear existing tokens and retry with demo mode
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("userName");
          
          // Retry with demo mode
          setTimeout(() => {
            fetchQuestions(category);
          }, 1000);
          return null; // Return null to indicate retry needed
        }
        
        // Server responded with error status
        const message =
          error.response.data?.message || "Failed to fetch questions";
        error(`Error: ${message}`);
      } else if (error.request) {
        // Request was made but no response received
        error(
          "Network error: Unable to connect to server. Please check your connection."
        );
      } else {
        // Something else happened
        error("An unexpected error occurred. Please try again.");
      }

      setSelectedCategory(""); // Go back to category selection
      return null; // Return null to indicate failure
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // First validate all answers
      const validation = validateAnswers();
      if (!validation.valid) {
        warning(validation.message);
        return;
      }

      // Get and validate authentication
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Extract user info from token
      let userId, userName;
      try {
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        userId = tokenPayload.id;
        
        // Get or fetch user name
        userName = localStorage.getItem("userName");
        if (!userName) {
          const userProfile = await fetchUserProfile(token);
          userName = userProfile.name || "User";
          localStorage.setItem("userName", userName);
        }
      } catch (err) {
        console.error("Authentication error:", err);
        error("Session expired. Please login again.");
        window.location.href = "/login";
        return;
      }

      console.log("Submitting with:", {
        userId,
        userName,
        category: selectedCategory,
        answersCount: Object.keys(answers).length,
        totalQuestions: questions.length,
      });

      setShowResult(true);

      // Submit to backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/certifications/submit`,
        {
          userId,
          userName,
          category: selectedCategory,
          answers,
          questions: questions.map(q => ({
            _id: q._id,
            type: q.type,
            correctAnswer: q.correctAnswer,
            question: q.question || q.title
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000,
        }
      );

      console.log("Submission successful:", response.data);
      setResult(response.data);
      
      // Remove certification answers from local storage
      localStorage.removeItem("certificationAnswers");

      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error("Failed to exit fullscreen mode:", err);
        });
      }

      if (response.data.passed) {
        setShowConfetti(true);
      }
    } catch (error) {
      console.error("Error submitting answers:", error);

      let errorMessage = "An error occurred while submitting your answers.";

      if (error.response) {
        // Server responded with error status
        console.error("Server error response:", error.response.data);
        errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;

        if (error.response.data?.details) {
          console.error("Error details:", error.response.data.details);
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error("Network error:", error.request);
        errorMessage = "Network error: Unable to connect to server.";
      } else {
        // Something else happened
        console.error("Submission error:", error.message);
        errorMessage = error.message;
      }

      error(errorMessage + " Please try again.");
      setShowResult(false); // Allow user to try again
    }
  };

  // New function to open name confirmation dialog
  const openNameConfirmationDialog = () => {
    const storedName = localStorage.getItem("userName") || "";
    setCertificateName(storedName);
    setShowNameConfirmation(true);
  };

  // Handle direct certificate generation and download with test result data
  const generateAndDownloadCertificate = async () => {
    if (!result || !certificateName.trim()) {
      warning("Please ensure your name is entered correctly");
      return;
    }

    setIsGeneratingCertificate(true);

    try {
      // Create PDF document in landscape orientation with proper settings
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
        compress: true
      });

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Add elegant background pattern
      const addBackground = () => {
        // Add wavy lines pattern
        doc.setDrawColor(245, 245, 245);
        doc.setLineWidth(0.1);
        for (let i = 0; i < pageHeight; i += 5) {
          doc.line(0, i, pageWidth, i);
        }

        // Add golden border
        doc.setDrawColor(176, 148, 108); // Golden color
        doc.setLineWidth(2);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

        // Add corner decorations
        const cornerSize = 20;
        doc.setFillColor(176, 148, 108);
        // Top left
        doc.rect(15, 15, cornerSize, 2, 'F');
        doc.rect(15, 15, 2, cornerSize, 'F');
        // Top right
        doc.rect(pageWidth - 15 - cornerSize, 15, cornerSize, 2, 'F');
        doc.rect(pageWidth - 17, 15, 2, cornerSize, 'F');
        // Bottom left
        doc.rect(15, pageHeight - 17, cornerSize, 2, 'F');
        doc.rect(15, pageHeight - 15 - cornerSize, 2, cornerSize, 'F');
        // Bottom right
        doc.rect(pageWidth - 15 - cornerSize, pageHeight - 17, cornerSize, 2, 'F');
        doc.rect(pageWidth - 17, pageHeight - 15 - cornerSize, 2, cornerSize, 'F');
      };
      addBackground();

      // Add logo/emblem
      doc.setFillColor(176, 148, 108);
      const logoSize = 20;
      doc.rect(pageWidth/2 - logoSize/2, 30, logoSize, logoSize, 'F');

      // Add certificate title
      doc.setFont("times", "bold");
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(40);
      doc.text("CERTIFICATE OF COMPLETION", pageWidth/2, 70, { align: "center" });

      // Add user name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(36);
      doc.text(certificateName, pageWidth/2, 110, { align: "center" });

      // Add course details
      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.setTextColor(80, 80, 80);
      doc.text(
        `Has successfully completed the ${selectedCategory} certification exam`,
        pageWidth/2,
        130,
        { align: "center" }
      );

      // Add score and performance
      const { score, totalQuestions, percentage, badgeType } = result;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(
        `Score: ${score}/${totalQuestions} (${percentage}%)`,
        pageWidth/2,
        150,
        { align: "center" }
      );

      // Add badge type with color
      let badgeColor;
      switch(badgeType.toLowerCase()) {
        case 'platinum':
          badgeColor = [90, 90, 90];
          break;
        case 'gold':
          badgeColor = [212, 175, 55];
          break;
        case 'silver':
          badgeColor = [192, 192, 192];
          break;
        default:
          badgeColor = [176, 148, 108];
      }
      doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
      doc.text(
        badgeType.toUpperCase() + " BADGE ACHIEVED",
        pageWidth/2,
        170,
        { align: "center" }
      );

      // Add date and certificate ID
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      
      const certIssueDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      // Add dividing lines for signature
      doc.setDrawColor(176, 148, 108);
      doc.setLineWidth(0.5);
      doc.line(pageWidth/2 - 50, pageHeight - 40, pageWidth/2 + 50, pageHeight - 40);

      // Add signature text
      doc.text("AUTHORIZED SIGNATURE", pageWidth/2, pageHeight - 30, { align: "center" });

      // Add date and certificate ID
      doc.text(`Issue Date: ${issueDate}`, 30, pageHeight - 30);
      doc.text(`Certificate ID: ${result.certificateId}`, pageWidth - 30, pageHeight - 30, { align: "right" });

      // Create the file name
      const fileName = `${selectedCategory}_Certificate_${certificateName.replace(/\s+/g, '_')}.pdf`;

      // Create blob and trigger download
      const pdfBlob = doc.output('blob');
      const blobUrl = window.URL.createObjectURL(pdfBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      downloadLink.style.display = 'none';
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(blobUrl);
        setCertificateDownloaded(true);
        setIsGeneratingCertificate(false);
      }, 100);

      // Set background
      doc.setFillColor(245, 245, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Add border
      doc.setDrawColor(65, 105, 225);
      doc.setLineWidth(1);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Calculate percentage and set performance text
      const certificatePercentage = (score / questions.length) * 100;
      let performanceText = "";
      let performanceColor = [];

      if (certificatePercentage >= 90) {
        performanceText = "Outstanding Achievement";
        performanceColor = [0, 100, 0];
      } else if (percentage >= 80) {
        performanceText = "Excellent Performance";
        performanceColor = [0, 128, 0];
      } else if (percentage >= 70) {
        performanceText = "Very Good";
        performanceColor = [46, 139, 87];
      } else {
        performanceText = "Passed Successfully";
        performanceColor = [70, 130, 180];
      }

      // Add certificate title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(40);
      doc.setTextColor(25, 25, 112);
      doc.text("Certificate of Achievement", pageWidth / 2, 40, { align: "center" });

      // Add main text
      doc.setFontSize(20);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(70, 70, 70);
      doc.text("This is to certify that", pageWidth / 2, 70, { align: "center" });

      // Add name
      doc.setFontSize(30);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(25, 25, 112);
      doc.text(certificateName, pageWidth / 2, 90, { align: "center" });

      // Add course completion text
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(70, 70, 70);
      doc.text(
        `has successfully completed the ${selectedCategory} certification exam`,
        pageWidth / 2,
        110,
        { align: "center" }
      );

      // Add score
      doc.setFontSize(20);
      doc.setTextColor(performanceColor[0], performanceColor[1], performanceColor[2]);
      doc.text(
        `Score: ${score}/${questions.length} (${percentage.toFixed(1)}%)`,
        pageWidth / 2,
        130,
        { align: "center" }
      );
      doc.text(`${performanceText}`, pageWidth / 2, 140, { align: "center" });

      // Generate unique identifiers
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      const certificateId = `UC-${Math.floor(100000 + Math.random() * 900000)}-${new Date().getFullYear()}`;
      const issueDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      // Add certificate details to PDF
      doc.setFontSize(12);
      doc.setTextColor(70, 70, 70);
      doc.text(`Issue Date: ${issueDate}`, 20, pageHeight - 20);
      doc.text(`Certificate ID: ${certificateId}`, pageWidth - 20, pageHeight - 20, { align: "right" });
      
      try {
        // Create file name with timestamp to ensure uniqueness
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
        const fileName = `${selectedCategory}_Certificate_${certificateName.replace(/\s+/g, '_')}_${timestamp}.pdf`;

        // Create blob from PDF
        const pdfBlob = doc.output('blob');
        
        // Create object URL for the blob
        const blobUrl = window.URL.createObjectURL(pdfBlob);

        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = fileName;
        downloadLink.style.display = 'none';
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(blobUrl);
        }, 100);

        // Mark as downloaded in local storage
        setCertificateDownloaded(true);
        localStorage.setItem(`certificate_${certificateId}`, 'true');

        console.log("Certificate generated and download triggered successfully");
      } catch (error) {
        console.error("Error in certificate download:", error);
        throw new Error("Failed to trigger certificate download");
      }

    } catch (err) {
      console.error("Error generating certificate:", err);
      error("Failed to generate certificate. Please try again.");
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  // Simplified certificate generation with fewer decorative elements
  const generateCertificate = async (userName, score, totalQuestions) => {
    setIsGeneratingCertificate(true);

    try {
      // Create PDF document in landscape orientation
      const doc = new jsPDF("landscape");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Simple background
      doc.setFillColor(245, 245, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Calculate pass grade text and color
      let performanceText, performanceColor;
      const percentage = (score / totalQuestions) * 100;

      if (percentage >= 90) {
        performanceText = "Excellence";
        performanceColor = [25, 111, 61]; // Dark green
      } else if (percentage >= 80) {
        performanceText = "Distinction";
        performanceColor = [39, 174, 96]; // Green
      } else if (percentage >= 70) {
        performanceText = "Merit";
        performanceColor = [41, 128, 185]; // Blue
      } else {
        performanceText = "Pass";
        performanceColor = [52, 73, 94]; // Dark blue-gray
      }

      // Create certificate ID for verification
      const certificateId = `UC-${Math.floor(
        100000 + Math.random() * 900000
      )}-${new Date().getFullYear()}`;

      // Simple border
      doc.setDrawColor(65, 105, 225);
      doc.setLineWidth(2);
      doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

      // Certificate title
      doc.setFont("times", "bold");
      doc.setTextColor(25, 25, 112);
      doc.setFontSize(42);
      doc.text("CERTIFICATE OF ACHIEVEMENT", pageWidth / 2, 80, {
        align: "center",
      });

      // Award text
      doc.setFontSize(16);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(70, 70, 70);
      doc.text("This is to certify that", pageWidth / 2, 105, {
        align: "center",
      });

      // Recipient name
      doc.setFont("times", "bolditalic");
      doc.setFontSize(34);
      doc.setTextColor(25, 25, 112);
      doc.text(userName, pageWidth / 2, 125, { align: "center" });

      // Achievement description
      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.setTextColor(70, 70, 70);
      doc.text(
        `has successfully completed the ${selectedCategory} Certification Examination with a score of`,
        pageWidth / 2,
        145,
        { align: "center" }
      );

      // Score highlight
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(
        performanceColor[0],
        performanceColor[1],
        performanceColor[2]
      );
      doc.text(
        `${score}/${totalQuestions} (${performanceText})`,
        pageWidth / 2,
        160,
        { align: "center" }
      );

      // Issue date
      const issueDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Date and certificate ID
      doc.setFont("helvetica", "italic");
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Issued on: ${issueDate}`, 60, 190);
      doc.text(`Certificate ID: ${certificateId}`, pageWidth - 60, 190, {
        align: "right",
      });

      // Save the PDF
      doc.save(
        `${userName.replace(/\s+/g, "_")}_${selectedCategory}_Certificate.pdf`
      );
      success("Certificate generated successfully!");
    } catch (err) {
      console.error("Error generating certificate:", err);
      error("Failed to generate certificate. Please try again.");
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const startTest = async () => {
    try {
      setLoading(true);
      
      // Directly fetch questions and start test
      const fetchedQuestions = await fetchQuestions(selectedCategory);
      
      if (!fetchedQuestions || fetchedQuestions.length === 0) {
        error('No questions available for this category');
        return;
      }
      
      // Start the test immediately
      setTestStarted(true);
      setShowTestDetails(false);
      
      // Enter fullscreen mode
      try {
        await document.documentElement.requestFullscreen();
      } catch (fullscreenError) {
        console.log('Fullscreen failed:', fullscreenError);
        // Continue without fullscreen if it fails
      }
      
    } catch (err) {
      console.error('Error starting test:', err);
      error('Failed to start test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleAnswerSelect = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }));
  };

  // Updated handleAnswer for coding questions
  const handleCodingAnswer = (code) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: code,
    }));
  };

  // New function to run coding test cases
  const runCodingTest = async (questionIndex, testCaseIndex = 0) => {
    const question = questions[questionIndex];
    if (!question || question.type !== "coding") return;

    try {
      setLoading(true);
      const response = await executeCodingTest(
        answers[questionIndex] || question.starterCode || "",
        question.language || "JavaScript",
        question._id,
        testCaseIndex
      );

      setCodingTestResults(prev => ({
        ...prev,
        [`${questionIndex}-${testCaseIndex}`]: response
      }));

      // Check if all test cases pass - safely check for testCases
      if (question.testCases && question.testCases.length > 0) {
        const allTestCasesPassed = question.testCases.every((_, idx) => {
          const result = codingTestResults[`${questionIndex}-${idx}`];
          return result && result.passed;
        });

        setCodingValidationStatus(prev => ({
          ...prev,
          [questionIndex]: allTestCasesPassed
        }));
      } else {
        // If there are no test cases, consider it as validated
        setCodingValidationStatus(prev => ({
          ...prev,
          [questionIndex]: true
        }));
      }

    } catch (error) {
      console.error("Error running coding test:", error);
    } finally {
      setLoading(false);
    }
  };

  // New function to run all test cases for a coding question
  const runAllCodingTests = async (questionIndex) => {
    const question = questions[questionIndex];
    if (!question || question.type !== "coding") {
      console.log("❌ Invalid question or not a coding question");
      return;
    }

    try {
      setLoading(true);
      
      console.log("🚀 Starting test execution for question:", question.title);
      console.log("📊 Question data:", question);
      
      // Get test cases - handle different property names
      let testCases = [];
      
      if (question.testCases && Array.isArray(question.testCases) && question.testCases.length > 0) {
        console.log("✅ Found test cases in question.testCases:", question.testCases.length);
        testCases = question.testCases;
      } else if (question.testcases && Array.isArray(question.testcases) && question.testcases.length > 0) {
        console.log("✅ Found test cases in question.testcases:", question.testcases.length);
        testCases = question.testcases;
      } else if (question.test_cases && Array.isArray(question.test_cases) && question.test_cases.length > 0) {
        console.log("✅ Found test cases in question.test_cases:", question.test_cases.length);
        testCases = question.test_cases;
      } else {
        console.log("⚠️ No test cases found, creating default ones");
        
        // Create appropriate test cases based on question
        if (question.title?.toLowerCase().includes("reverse")) {
          testCases = [
            {
              input: '["h","e","l","l","o"]',
              expectedOutput: '["o","l","l","e","h"]',
              isHidden: false
            },
            {
              input: '["H","a","n","n","a","h"]',
              expectedOutput: '["h","a","n","n","a","H"]',
              isHidden: false
            }
          ];
        } else if (question.title?.toLowerCase().includes("palindrome")) {
          testCases = [
            {
              input: "121",
              expectedOutput: "true",
              isHidden: false
            },
            {
              input: "-121",
              expectedOutput: "false",
              isHidden: false
            }
          ];
        } else {
          // Generic test case
          testCases = [
            {
              input: "test",
              expectedOutput: "test",
              isHidden: false
            }
          ];
        }
        
        console.log("📝 Created default test cases:", testCases);
      }
      
      // Get the code from answers
      const code = answers[questionIndex];
      if (!code || code.trim() === "") {
        error("Please write some code before running tests!");
        return;
      }
      
      // Get the language - check multiple sources with fallback
      let language = questionLanguages[questionIndex] || 
                   question.language || 
                   question.category || 
                   "JavaScript";
      
      // Normalize language names
      const languageMap = {
        'js': 'JavaScript',
        'javascript': 'JavaScript',
        'py': 'Python',
        'python': 'Python',
        'java': 'Java',
        'cpp': 'C++',
        'c++': 'C++',
        'c': 'C'
      };
      
      language = languageMap[language.toLowerCase()] || language;
      
      console.log(`🔧 Executing tests with:
📝 Language: ${language}
📋 Question ID: ${question._id}
🧪 Test Cases: ${testCases.length}
💻 Code Length: ${code.length} chars`);
      
      // Use our API service to run all test cases
      const results = await runAllTestCases(code, language, question._id, testCases);
      
      console.log("📊 Test results:", results);
      
      // Update the results state for each test case
      results.forEach((result, i) => {
        setCodingTestResults(prev => ({
          ...prev,
          [`${questionIndex}-${i}`]: result
        }));
      });
      
      // Check if all test cases passed
      const allTestCasesPassed = results.every(result => result && result.passed);
      
      // Store the test cases on the question object for UI rendering
      const updatedQuestions = [...questions];
      if (!updatedQuestions[questionIndex].testCases || updatedQuestions[questionIndex].testCases.length === 0) {
        updatedQuestions[questionIndex].testCases = testCases;
        setQuestions(updatedQuestions);
        console.log("✅ Updated question with test cases");
      }
      
      // Update validation status
      setCodingValidationStatus(prev => ({
        ...prev,
        [questionIndex]: allTestCasesPassed
      }));
      
      // Show result notification
      if (allTestCasesPassed) {
        success(`✅ All ${results.length} test cases passed!`);
      } else {
        const passedCount = results.filter(r => r.passed).length;
        error(`❌ ${passedCount}/${results.length} test cases passed. Please fix your solution.`);
      }
      
    } catch (error) {
      console.error("❌ Error running all coding tests:", error);
      error("Failed to run tests: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const resetTest = () => {
    // Reset question-related state
    setSelectedCategory("");
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    
    // Reset exam state
    setTestStarted(false);
    setTimeRemaining(1800);
    setExamStarted(false);
    
    // Reset results and validation
    setShowResult(false);
    setResult(null);
    setCodingTestResults({});
    setCodingValidationStatus({});
    setAllTestsRun(false);
    
    // Reset UI state
    setShowConfetti(false);
    setShowNameConfirmation(false);
    setShowAgreementDialog(false);
    setShowTestDetails(true);
    
    // Reset certificate state
    setCertificateName("");
    setIsGeneratingCertificate(false);
    setCertificateDownloaded(false);
  };

  // Category selection screen
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Choose Your <span className="text-blue-400">Certification</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Select a category to start your certification test. Each test
              contains 30 questions and you need 65% to pass and earn your
              certificate.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => {
                  if (category.isModern) {
                    window.location.href = '/exam';
                  } else {
                    setSelectedCategory(category.id);
                  }
                }}
              >
                <div
                  className={`bg-gradient-to-br ${category.color} p-1 rounded-xl shadow-lg transform group-hover:scale-105 transition-all duration-300`}
                >
                  <div className="bg-gray-800 rounded-lg p-6 h-full">
                    <div className="text-center">
                      <div className="text-4xl mb-4">{category.icon}</div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {category.name}
                      </h3>
                      <p className="text-gray-400 mb-4">
                        {category.description}
                      </p>
                      <div
                        className={`inline-block px-4 py-2 bg-gradient-to-r ${category.color} text-white rounded-lg font-semibold group-hover:shadow-lg transition-shadow flex items-center space-x-2`}
                      >
                        {category.isModern && <FaCode className="w-4 h-4" />}
                        <span>{category.isModern ? 'Start Modern Exam' : 'Start Test'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Loading screen
  if (loading) {
    console.log('Rendering loading screen - loading:', loading);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Result screen
  if (showResult && result) {
    const selectedCat = categories.find((cat) => cat.id === selectedCategory);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-6">
        {showConfetti && (
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-xl p-8 max-w-lg w-full text-center border border-gray-700"
        >
          <div className="text-6xl mb-4">{result.passed ? "🎉" : "😔"}</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {result.passed ? "Congratulations!" : "Better Luck Next Time!"}
          </h2>
          <div className="text-xl text-gray-300 mb-6">
            <p>
              Score: {result.score}/{result.totalQuestions}
            </p>
            <p>Percentage: {result.percentage?.toFixed(1)}%</p>
            <p className="text-sm text-gray-400 mt-2">
              Category: {selectedCat?.name}
            </p>
          </div>
          {result.passed && (
            <div className="mb-4 space-y-3">
              <PDFDownloadLink
                document={
                  <CertificateDocument
                    name={certificateName || localStorage.getItem("userName") || "Certificate Holder"}
                    result={result}
                    category={selectedCategory}
                  />
                }
                fileName={`${selectedCategory}_Certificate_${(certificateName || "User").replace(/\s+/g, '_')}.pdf`}
                className={`inline-block px-6 py-3 rounded-lg font-semibold transition ${
                  certificateDownloaded
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white relative overflow-hidden`}
                style={{
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {({ loading }) => (
                  loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Preparing Certificate...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <FaDownload className="w-5 h-5" />
                      <span>Download Your Certificate</span>
                    </div>
                  )
                )}
              </PDFDownloadLink>
              {certificateDownloaded && (
                <div className="mt-2">
                  <p className="text-sm text-gray-400">
                    Your certificate has been downloaded successfully. Check your downloads folder.
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Note: For security reasons, each certificate can only be downloaded once.
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => fetchQuestions(selectedCategory)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retake Test
            </button>
            <button
              onClick={resetTest}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Choose Different Category
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Test screen
  if (!testStarted) {
    console.log('Rendering test start screen - testStarted:', testStarted, 'selectedCategory:', selectedCategory);
    const selectedCat = categories.find((cat) => cat.id === selectedCategory);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full text-center border border-gray-700"
        >
          <div className="text-4xl mb-4">{selectedCat?.icon}</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {selectedCat?.name} Certification
          </h2>
          
          <div className="text-gray-300 mb-6 space-y-2">
            <p>• 30 Multiple Choice Questions</p>
            <p>• 30 Minutes Time Limit</p>
            <p>• 65% Required to Pass</p>
            <p>• Certificate upon successful completion</p>
          </div>

          {/* Demo Notice */}
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-4 text-left">
            <h3 className="text-lg font-semibold text-blue-400 mb-2 flex items-center">
              💡 Demo Mode Available
            </h3>
            <p className="text-blue-200 text-sm">
              You can take this exam without logging in! The system will automatically use demo mode if you're not authenticated.
            </p>
          </div>

          {/* Security Notice */}
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center">
              <FaExclamationTriangle className="mr-2" />
              Secure Exam Environment
            </h3>
            <ul className="text-red-200 text-sm space-y-1">
              <li>• Fullscreen mode required (no switching tabs/apps)</li>
              <li>• Camera monitoring for identity verification</li>
              <li>• Copy/paste operations disabled</li>
              <li>• Maximum 3 security violations allowed</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={startTest}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center gap-2"
            >
              <FaExclamationTriangle />
              Start Secure Exam
            </button>
            <button
              onClick={resetTest}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Back to Categories
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Questions screen with mixed MCQ and coding questions
  if (testStarted && questions.length > 0) {
    console.log('Rendering exam screen - testStarted:', testStarted, 'questions.length:', questions.length);
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6 certification-test">
        {/* Warning Message for Copy/Paste attempts */}
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2" />
              <span>{warningMessage}</span>
            </div>
          </motion.div>
        )}
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-white">
                {categories.find((cat) => cat.id === selectedCategory)?.name}{" "}
                Test
              </h1>
              <div className="text-xl font-mono text-red-400">
                ⏰ {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-gray-400 text-sm">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          {/* Question */}
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700"
          >
            {/* Question Type Indicator */}
            <div className="flex items-center mb-4">
              {currentQ?.type === "mcq" ? (
                <>
                  <FaQuestionCircle className="text-blue-400 mr-2" />
                  <span className="text-blue-400 font-semibold">
                    MCQ Question
                  </span>
                </>
              ) : (
                <>
                  <FaCode className="text-green-400 mr-2" />
                  <span className="text-green-400 font-semibold">
                    Coding Problem
                  </span>
                </>
              )}
            </div>

            {/* MCQ Question */}
            {currentQ?.type === "mcq" ? (
              <>
                <h2 className="text-xl font-semibold text-white mb-6">
                  {currentQ?.question}
                </h2>
                <div className="space-y-3">
                  {currentQ?.options?.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
                        answers[currentQuestion] === option
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="font-medium mr-3">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (
              /* Coding Question */
              <>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {currentQ?.title}
                </h2>
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {currentQ?.description}
                  </p>
                </div>
                {currentQ?.constraints && (
                  <div className="bg-gray-700 p-3 rounded-lg mb-4">
                    <h4 className="text-white font-semibold mb-2">
                      Constraints:
                    </h4>
                    <p className="text-gray-300 text-sm">
                      {currentQ.constraints}
                    </p>
                  </div>
                )}
                
                {/* Test Cases Section */}
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-white font-semibold">Test Cases</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => runAllCodingTests(currentQuestion)}
                        disabled={loading}
                        className={`px-3 py-1.5 ${
                          codingValidationStatus[currentQuestion]
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        } disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-70 rounded text-sm flex items-center space-x-1 transition-all`}
                      >
                        {loading ? (
                          <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                        ) : codingValidationStatus[currentQuestion] ? (
                          <FaCheck className="text-xs" />
                        ) : (
                          <FaPlay className="text-xs" />
                        )}
                        <span>{loading ? "Running..." : codingValidationStatus[currentQuestion] ? "All Tests Passed" : "Run All Tests"}</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Validation Status */}
                  {codingValidationStatus[currentQuestion] !== undefined && (
                    <div className={`flex items-center space-x-2 text-sm ${
                      codingValidationStatus[currentQuestion] 
                        ? "text-green-400" 
                        : "text-red-400"
                    }`}>
                      {codingValidationStatus[currentQuestion] ? (
                        <FaCheck />
                      ) : (
                        <FaExclamationTriangle />
                      )}
                      <span>
                        {codingValidationStatus[currentQuestion] 
                          ? "All test cases passed" 
                          : "Some test cases failed"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  <label className="block text-gray-300 mb-2">
                    Your Solution:
                  </label>
                  
                  {/* Language Selector for Coding Questions */}
                  <div className="mb-4 bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-gray-300 font-semibold">
                        Programming Language:
                      </label>
                      <div className="text-xs text-gray-400">
                        Click to change starter code
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none flex-1"
                        value={questionLanguages[currentQuestion] || currentQ?.language || "JavaScript"}
                        onChange={(e) => {
                          const newLanguage = e.target.value;
                          
                          // Update language state immediately
                          setQuestionLanguages(prev => ({
                            ...prev,
                            [currentQuestion]: newLanguage
                          }));
                          
                          // Smart starter code generation that preserves function signatures
                          const generateStarterCode = (targetLanguage) => {
                            const originalStarter = currentQ?.starterCode || "";
                            
                            // Extract function name and parameters from original starter code
                            let functionName = "solution";
                            let parameters = "";
                            
                            // Try to extract from JavaScript function pattern
                            const jsMatch = originalStarter.match(/function\s+(\w+)\s*\(([^)]*)\)/);
                            if (jsMatch) {
                              functionName = jsMatch[1];
                              parameters = jsMatch[2];
                            }
                            
                            // Try to extract from Python function pattern  
                            const pyMatch = originalStarter.match(/def\s+(\w+)\s*\(([^)]*)\)/);
                            if (pyMatch) {
                              functionName = pyMatch[1];
                              parameters = pyMatch[2];
                            }
                            
                            // Convert parameters between languages if needed
                            const convertParameters = (params, toLang) => {
                              if (!params.trim()) return "";
                              
                              // For now, keep parameters as-is since most coding problems use simple parameter names
                              // that work across languages (nums, target, etc.)
                              return params;
                            };
                            
                            const convertedParams = convertParameters(parameters, targetLanguage);
                            
                            switch (targetLanguage) {
                              case 'JavaScript':
                                return `function ${functionName}(${convertedParams}) {
    // Write your JavaScript solution here
    
}`;
                              case 'Python':
                                return `def ${functionName}(${convertedParams}):
    # Write your Python solution here
    pass`;
                              case 'Java':
                                // For Java, create a method inside a Solution class
                                // For Two Sum type problems, assume int[] and int parameters
                                let javaParams = convertedParams;
                                if (functionName === 'twoSum') {
                                  javaParams = 'int[] nums, int target';
                                } else if (functionName === 'reverseString') {
                                  javaParams = 'char[] s';
                                } else {
                                  // Generic conversion - try to infer types
                                  javaParams = convertedParams.replace(/\bnums\b/g, 'int[] nums')
                                                             .replace(/\btarget\b/g, 'int target')
                                                             .replace(/\bs\b/g, 'char[] s');
                                }
                                
                                // Determine return type based on function name
                                let returnType = 'int[]';
                                if (functionName === 'reverseString') {
                                  returnType = 'void';
                                } else if (functionName.includes('palindrome') || functionName.includes('valid')) {
                                  returnType = 'boolean';
                                }
                                
                                return `public class Solution {
    public ${returnType} ${functionName}(${javaParams}) {
        // Write your Java solution here
        ${returnType === 'void' ? '' : returnType === 'boolean' ? 'return false;' : 'return new int[0];'}
    }
}`;
                              default:
                                return originalStarter;
                            }
                          };
                          
                          const starterCodes = {
                            JavaScript: generateStarterCode('JavaScript'),
                            Python: generateStarterCode('Python'),
                            Java: generateStarterCode('Java')
                          };
                          
                          const currentCode = answers[currentQuestion] || "";
                          
                          // Check if current code is just starter/template code or if user has written custom code
                          const isEmptyOrMinimal = !currentCode.trim();
                          const isTemplateCode = currentCode.includes("// Write your") || 
                                                currentCode.includes("# Write your") || 
                                                currentCode.includes("// Your solution here") ||
                                                currentCode === currentQ?.starterCode;
                          
                          // Only auto-update if code is empty or clearly template code  
                          if (isEmptyOrMinimal || (isTemplateCode && currentCode.length < 200)) {
                            // Automatically update starter code
                            setAnswers(prev => ({
                              ...prev,
                              [currentQuestion]: starterCodes[newLanguage] || ""
                            }));
                            success(`Language changed to ${newLanguage}! Template updated automatically. 🚀`);
                          } else {
                            // User has written custom code - ask for confirmation
                            const userConfirmed = window.confirm(
                              `⚠️  You have written custom code!\n\n` +
                              `Changing to ${newLanguage} will REPLACE your current code with a ${newLanguage} template.\n\n` +
                              `• Click OK to REPLACE your code with ${newLanguage} template\n` +
                              `• Click Cancel to KEEP your code and just change execution language`
                            );
                            
                            if (userConfirmed) {
                              setAnswers(prev => ({
                                ...prev,
                                [currentQuestion]: starterCodes[newLanguage] || ""
                              }));
                              success(`Language changed to ${newLanguage}! Code replaced with template. 🚀`);
                            } else {
                              // Just change language for execution, keep existing code
                              success(`Language changed to ${newLanguage}! Your code will be executed as ${newLanguage}. 💡`);
                            }
                          }
                        }}
                      >
                        <option value="JavaScript">🚀 JavaScript</option>
                        <option value="Python">🐍 Python</option>
                        <option value="Java">☕ Java</option>
                      </select>
                      
                      {/* Current Language Indicator */}
                      <div className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                        {questionLanguages[currentQuestion] || currentQ?.language || "JavaScript"}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Code Editor with IDE features */}
                  <div className="h-64 rounded-lg overflow-hidden border border-gray-700 relative">
                    <div className="flex bg-gray-900 rounded-lg border border-gray-600 focus-within:border-blue-500 h-full">
                      {/* Line Numbers */}
                      <div 
                        key={`lines-${currentQuestion}-${questionLanguages[currentQuestion] || currentQ?.language || "JavaScript"}`}
                        className="bg-gray-800 px-3 py-4 text-gray-400 font-mono text-sm select-none border-r border-gray-600 min-w-[50px]"
                      >
                        {(answers[currentQuestion] || currentQ?.starterCode || "").split('\n').map((_, index) => (
                          <div key={index} className="leading-6 text-right">{index + 1}</div>
                        ))}
                      </div>
                      
                      {/* Code Editor - Simplified Clean Implementation */}
                      <div className="flex-1 relative">
                        <textarea
                          key={`editor-${currentQuestion}-${questionLanguages[currentQuestion] || currentQ?.language || "JavaScript"}`}
                          className="w-full h-full bg-gray-900 text-white p-4 font-mono text-sm resize-none focus:outline-none leading-6 border-none"
                          value={answers[currentQuestion] || currentQ?.starterCode || ""}
                          onChange={(e) => handleCodingAnswerWithFeatures(e.target.value)}
                          onKeyDown={(e) => handleCodeEditorKeyDown(e, e.target)}
                          readOnly={loading}
                          placeholder={`Enter your ${questionLanguages[currentQuestion] || currentQ?.language || "JavaScript"} code here...\n\n💡 IDE Features Available:\n• Auto bracket/quote completion: (), [], {}, "", ''\n• Smart indentation (Tab/Enter)\n• Tab = 4 spaces\n• Ctrl+Enter = Run test\n• Typing optimized for smooth experience\n• Language selector working ✅\n• Backend connected ✅`}
                          spellCheck={false}
                          style={{
                            tabSize: 4,
                            WebkitTabSize: 4,
                            MozTabSize: 4,
                            lineHeight: '1.5rem',
                            color: '#ffffff', // Pure white text for better visibility
                            caretColor: '#60a5fa', // Blue cursor
                            background: 'transparent'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Run Code Button */}
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => runSingleTestCase(currentQuestion, 0)}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                      <FaPlay />
                      Run Code
                    </button>
                  </div>
                </div>
                
                {/* Prominent Run Tests Button */}
                <div className="mb-4">
                  <button
                    onClick={() => runAllCodingTests(currentQuestion)}
                    disabled={loading}
                    className={`w-full py-3 flex items-center justify-center gap-2 rounded-lg font-semibold ${
                      codingValidationStatus[currentQuestion]
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    {loading ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    ) : codingValidationStatus[currentQuestion] ? (
                      <FaCheck className="text-sm" />
                    ) : (
                      <FaPlay className="text-sm" />
                    )}
                    <span>{loading 
                      ? "Running Tests..." 
                      : codingValidationStatus[currentQuestion] 
                        ? "All Tests Passed ✓" 
                        : "Run All Tests"}
                    </span>
                  </button>
                </div>
              </>
            )}
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-2 max-w-md overflow-x-auto">
              {questions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-8 h-8 rounded-full text-sm font-semibold transition flex-shrink-0 ${
                    index === currentQuestion
                      ? "bg-blue-600 text-white"
                      : answers[index]
                      ? q.type === "mcq"
                        ? "bg-blue-500 text-white"
                        : "bg-green-500 text-white"
                      : q.type === "mcq"
                      ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  title={q.type === "mcq" ? "MCQ" : "Coding"}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestion === questions.length - 1 ? (
              <div className="space-y-2">
                {!allTestsRun && questions.some(q => q.type === "coding") && (
                  <div className="bg-yellow-800/30 border border-yellow-500/50 text-yellow-400 p-3 rounded-lg text-center">
                    <FaExclamationTriangle className="inline-block mr-2" />
                    Please run and pass all test cases before submitting
                  </div>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!allTestsRun && questions.some(q => q.type === "coding")}
                  className={`px-6 py-4 w-full flex items-center justify-center gap-2 ${
                    !allTestsRun && questions.some(q => q.type === "coding")
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white rounded-lg transition font-semibold text-lg`}
                >
                  {!allTestsRun && questions.some(q => q.type === "coding") ? (
                    <>
                      <FaPlay />
                      <span>Run All Tests First</span>
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      <span>Submit Test</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Name Confirmation Dialog */}
        {showNameConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Confirm Your Name for Certificate
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Please enter your full name as you want it to appear on the certificate.
                This cannot be changed after the certificate is generated.
              </p>
              <input
                type="text"
                value={certificateName}
                onChange={(e) => setCertificateName(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-md mb-4 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter your full name"
                autoFocus
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNameConfirmation(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generateAndDownloadCertificate}
                  disabled={!certificateName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>Generate Certificate</span>
                  {isGeneratingCertificate && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }
};

export default Certifications;
