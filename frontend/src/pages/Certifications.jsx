import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FaCertificate,
  FaCode,
  FaTimes,
  FaPlay,
  FaStop,
  FaQuestionCircle,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  fetchCertificationQuestions,
  submitCertificationAnswers,
  fetchUserProfile,
} from "../api/certification";
import jsPDF from "jspdf";
import Confetti from "react-confetti";

const Certifications = () => {
  const [activeTab, setActiveTab] = useState("available");
  const [certifications, setCertifications] = useState([]);
  const [activeCertification, setActiveCertification] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [showTestDetails, setShowTestDetails] = useState(true);
  const [showAgreementDialog, setShowAgreementDialog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false); // State to control confetti
  const [showNameConfirmation, setShowNameConfirmation] = useState(false); // New state for name confirmation
  const [certificateName, setCertificateName] = useState(""); // New state for certificate name
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false); // State for certificate generation
  const [currentPage, setCurrentPage] = useState(1);
  const [score, setScore] = useState(0);

  // Add missing state variables
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [codingTestResults, setCodingTestResults] = useState({});
  const [codingValidationStatus, setCodingValidationStatus] = useState({});
  const [showCodingTestModal, setShowCodingTestModal] = useState(false);
  const [currentCodingQuestion, setCurrentCodingQuestion] = useState(null);

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

  useEffect(() => {
    if (examStarted) {
      const handleFullScreenChange = () => {
        if (!document.fullscreenElement) {
          // User exited full-screen mode
          handleSubmit();
        }
      };

      document.addEventListener("fullscreenchange", handleFullScreenChange);

      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullScreenChange
        );
      };
    }
  }, [examStarted]);

  const handleAnswer = (index, answer) => {
    setAnswers((prev) => ({ ...prev, [index]: answer }));
  };

  // Updated fetchQuestions function to get mixed MCQ and coding questions
  const fetchQuestions = async (category) => {
    setLoading(true);
    try {
      console.log("Fetching questions for category:", category);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/certifications/questions`, // Use plural 'certifications' to match backend routes
        {
          params: { category },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      console.log("Questions received:", response.data);

      if (!response.data || response.data.length === 0) {
        alert(
          `No questions available for ${category}. Please contact admin to add questions.`
        );
        setSelectedCategory(""); // Go back to category selection
        return;
      }

      setQuestions(response.data);
      setAnswers({}); // Reset answers as object
      setCurrentQuestion(0);
      setTestStarted(true);
      setTimeRemaining(1800); // Reset timer to 30 minutes
      setExamStarted(true);
    } catch (error) {
      console.error("Error fetching questions:", error);

      // More detailed error handling
      if (error.response) {
        // Server responded with error status
        const message =
          error.response.data?.message || "Failed to fetch questions";
        alert(`Error: ${message}`);
      } else if (error.request) {
        // Request was made but no response received
        alert(
          "Network error: Unable to connect to server. Please check your connection."
        );
      } else {
        // Something else happened
        alert("An unexpected error occurred. Please try again.");
      }

      setSelectedCategory(""); // Go back to category selection
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("Starting submission...");

      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Get user ID from token payload instead of localStorage
      let userId, userName;

      try {
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        userId = tokenPayload.id;
        console.log("User ID from token:", userId);

        // Get user name from localStorage or profile
        userName = localStorage.getItem("userName");

        if (!userName) {
          const userProfile = await fetchUserProfile(token);
          userName = userProfile.name || "User";
          localStorage.setItem("userName", userName);
        }
      } catch (tokenError) {
        console.error("Error decoding token:", tokenError);
        // Fallback to localStorage values
        userId = localStorage.getItem("userId");
        userName = localStorage.getItem("userName") || "User";
      }

      if (!userId) {
        alert("User authentication error. Please login again.");
        window.location.href = "/login";
        return;
      }

      // Check if all coding questions have passed their test cases
      const codingQuestions = questions.filter(q => q.type === "coding");
      const unvalidatedCodingQuestions = codingQuestions.filter((_, index) => {
        const questionIndex = questions.findIndex(q => q._id === questions[index]._id);
        return !codingValidationStatus[questionIndex];
      });

      if (unvalidatedCodingQuestions.length > 0) {
        alert("Please run and pass all test cases for coding questions before submitting!");
        return;
      }

      if (Object.keys(answers).length < questions.length) {
        alert("Please answer all questions before submitting!");
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
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000,
        }
      );

      console.log("Submission successful:", response.data);
      setResult(response.data);
      setScore(response.data.score);

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

      alert(errorMessage + " Please try again.");
      setShowResult(false); // Allow user to try again
    }
  };

  // New function to open name confirmation dialog
  const openNameConfirmationDialog = () => {
    const storedName = localStorage.getItem("userName") || "";
    setCertificateName(storedName);
    setShowNameConfirmation(true);
  };

  // New function to handle name confirmation
  const handleNameConfirmation = () => {
    if (!certificateName.trim()) {
      alert("Please enter a valid name for your certificate");
      return;
    }
    setShowNameConfirmation(false);
    generateCertificate(certificateName, score, questions.length);
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
      alert("Certificate generated successfully!");
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const startTest = () => {
    setShowAgreementDialog(true);
  };

  const agreeToStartTest = () => {
    setShowAgreementDialog(false);
    setShowTestDetails(false);
    setTestStarted(true);

    // Enter full-screen mode
    document.documentElement.requestFullscreen().catch((err) => {
      console.error("Failed to enter fullscreen mode:", err);
    });

    // Disable copy-paste
    document.addEventListener("copy", (e) => e.preventDefault());
    document.addEventListener("cut", (e) => e.preventDefault());
    document.addEventListener("paste", (e) => e.preventDefault());
    document.addEventListener("contextmenu", (e) => e.preventDefault());
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
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/certifications/coding/execute`,
        {
          code: answers[questionIndex] || question.starterCode || "",
          language: "JavaScript", // Default to JavaScript for now
          questionId: question._id,
          testCaseIndex,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setCodingTestResults(prev => ({
        ...prev,
        [`${questionIndex}-${testCaseIndex}`]: response.data
      }));

      // Check if all test cases pass
      const allTestCasesPassed = question.testCases?.every((_, idx) => {
        const result = codingTestResults[`${questionIndex}-${idx}`];
        return result && result.passed;
      });

      setCodingValidationStatus(prev => ({
        ...prev,
        [questionIndex]: allTestCasesPassed
      }));

    } catch (error) {
      console.error("Error running coding test:", error);
    } finally {
      setLoading(false);
    }
  };

  // New function to run all test cases for a coding question
  const runAllCodingTests = async (questionIndex) => {
    const question = questions[questionIndex];
    if (!question || question.type !== "coding") return;

    try {
      setLoading(true);
      const promises = question.testCases?.map((_, testCaseIndex) =>
        runCodingTest(questionIndex, testCaseIndex)
      ) || [];

      await Promise.all(promises);
    } catch (error) {
      console.error("Error running all coding tests:", error);
    } finally {
      setLoading(false);
    }
  };

  // New function to open coding test modal
  const openCodingTestModal = (questionIndex) => {
    setCurrentCodingQuestion({ index: questionIndex, question: questions[questionIndex] });
    setShowCodingTestModal(true);
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
    setSelectedCategory("");
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
    setResult(null);
    setTestStarted(false);
    setTimeRemaining(1800);
    setShowConfetti(false);
    setShowNameConfirmation(false);
    setCertificateName("");
    setCurrentPage(1);
    setScore(0);
    setExamStarted(false);
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
                onClick={() => setSelectedCategory(category.id)}
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
                        className={`inline-block px-4 py-2 bg-gradient-to-r ${category.color} text-white rounded-lg font-semibold group-hover:shadow-lg transition-shadow`}
                      >
                        Start Test
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
              {result.certificateUrl && (
                <motion.a
                  href={`${import.meta.env.VITE_API_URL}${
                    result.certificateUrl
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition mr-3"
                  whileHover={{ scale: 1.05 }}
                >
                  Download Server Certificate
                </motion.a>
              )}
              <motion.button
                onClick={openNameConfirmationDialog}
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                whileHover={{ scale: 1.05 }}
                disabled={isGeneratingCertificate}
              >
                {isGeneratingCertificate
                  ? "Generating..."
                  : "Generate Custom Certificate"}
              </motion.button>
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
    const selectedCat = categories.find((cat) => cat.id === selectedCategory);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-8 max-w-lg w-full text-center border border-gray-700"
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
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => fetchQuestions(selectedCategory)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Start Test
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
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
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
                {currentQ?.testCases && currentQ.testCases.length > 0 && (
                  <div className="bg-gray-700 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-white font-semibold">Test Cases</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => runAllCodingTests(currentQuestion)}
                          disabled={loading}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm flex items-center space-x-1"
                        >
                          <FaPlay className="text-xs" />
                          <span>Run All Tests</span>
                        </button>
                        <button
                          onClick={() => openCodingTestModal(currentQuestion)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                        >
                          View Test Cases
                        </button>
                      </div>
                    </div>
                    
                    {/* Test Status Summary */}
                    <div className="flex space-x-4 text-sm mb-3">
                      <span className="text-gray-400">
                        Total: {currentQ.testCases.length}
                      </span>
                      <span className="text-green-400">
                        Passed: {currentQ.testCases.filter((_, idx) => {
                          const result = codingTestResults[`${currentQuestion}-${idx}`];
                          return result && result.passed;
                        }).length}
                      </span>
                      <span className="text-red-400">
                        Failed: {currentQ.testCases.filter((_, idx) => {
                          const result = codingTestResults[`${currentQuestion}-${idx}`];
                          return result && !result.passed;
                        }).length}
                      </span>
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
                )}

                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">
                    Your Solution:
                  </label>
                  <textarea
                    value={
                      answers[currentQuestion] || currentQ?.starterCode || ""
                    }
                    onChange={(e) => handleCodingAnswer(e.target.value)}
                    className="w-full h-64 p-4 bg-gray-900 text-white font-mono text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write your code here..."
                  />
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
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Submit Test
              </button>
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
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">
                Confirm Your Name for Certificate
              </h3>
              <input
                type="text"
                value={certificateName}
                onChange={(e) => setCertificateName(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-md mb-4"
                placeholder="Enter your full name"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNameConfirmation(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNameConfirmation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Generate Certificate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Add the coding test modal
  const renderCodingTestModal = () => (
    showCodingTestModal && currentCodingQuestion && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">
              Test Cases - {currentCodingQuestion.question.title}
            </h3>
            <button
              onClick={() => setShowCodingTestModal(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {currentCodingQuestion.question.testCases?.map((testCase, index) => {
              const result = codingTestResults[`${currentCodingQuestion.index}-${index}`];
              return (
                <div key={index} className="bg-gray-700 p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-white">Test Case {index + 1}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => runCodingTest(currentCodingQuestion.index, index)}
                        disabled={loading}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm flex items-center space-x-1"
                      >
                        <FaPlay className="text-xs" />
                        <span>Run</span>
                      </button>
                      {result && (
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          result.passed 
                            ? "bg-green-600 text-white" 
                            : "bg-red-600 text-white"
                        }`}>
                          {result.passed ? "PASS" : "FAIL"}
                        </span>
                      )}
                    </div>
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
                    {result && (
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-gray-400 text-sm">
                            Your Output:
                          </span>
                          {result.passed ? (
                            <FaCheck className="text-green-400 text-sm" />
                          ) : (
                            <FaTimes className="text-red-400 text-sm" />
                          )}
                        </div>
                        <pre
                          className={`p-2 rounded mt-1 text-sm ${
                            result.passed
                              ? "bg-green-900/20"
                              : "bg-red-900/20"
                          }`}
                        >
                          {result.output}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* ... existing JSX ... */}
      
      {/* Add the coding test modal */}
      {renderCodingTestModal()}
      
      {/* ... rest of existing JSX ... */}
    </div>
  );
};

export default Certifications;
