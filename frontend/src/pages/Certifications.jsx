import { useState, useEffect } from "react";
import {
  fetchCertificationQuestions,
  submitCertificationAnswers,
  fetchUserProfile,
} from "../api/certification";
import jsPDF from "jspdf";
import React from "react";
import Confetti from "react-confetti";


const Certifications = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(1800); // 30 minutes in seconds
  const [showTestDetails, setShowTestDetails] = useState(true);
  const [showAgreementDialog, setShowAgreementDialog] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false); // State to control confetti
  const [showNameConfirmation, setShowNameConfirmation] = useState(false); // New state for name confirmation
  const [certificateName, setCertificateName] = useState(""); // New state for certificate name
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false); // State for certificate generation

  const questionsPerPage = 5;
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const data = await fetchCertificationQuestions();
        if (data && data.length > 0) {
          setQuestions(data);
        } else {
          console.warn("No questions available");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0 && !submitted && testStarted) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && !submitted && testStarted) {
      handleSubmit();
    }
    return () => clearInterval(interval);
  }, [timer, submitted, testStarted]);

  useEffect(() => {
    if (testStarted) {
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
  }, [testStarted]);

  const handleAnswer = (index, answer) => {
    setAnswers((prev) => ({ ...prev, [index]: answer }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      let userId = localStorage.getItem("userId");
      let userName = localStorage.getItem("userName");

      if (!userId || !userName) {
        const userProfile = await fetchUserProfile();
        userId = userProfile._id;
        userName = userProfile.name;
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", userName);
      }

      if (Object.keys(answers).length < questions.length) {
        alert("Please answer all questions before submitting!");
        return;
      }

      setSubmitted(true);

      let correctCount = 0;
      questions.forEach((q, index) => {
        if (answers[index] === q.correctAnswer) correctCount++;
      });

      setScore(correctCount);
      const percentage = (correctCount / questions.length) * 100;
      const passed = percentage >= 1;

      const formattedAnswers = questions.map(
        (q, index) => answers[index] || ""
      );

      const res = await submitCertificationAnswers(
        userId,
        userName,
        "React",
        formattedAnswers
      );

      setResult({ ...res, passed });

      localStorage.removeItem("certificationAnswers");

      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error("Failed to exit fullscreen mode:", err);
        });
      }

      if (passed) {
        setShowConfetti(true);
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
      alert(
        "An error occurred while submitting your answers. Please try again."
      );
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
        `has successfully completed the React Certification Examination with a score of`,
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
      doc.save(`${userName.replace(/\s+/g, "_")}_React_Certificate.pdf`);
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

  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const paginatedQuestions = questions.slice(startIndex, endIndex);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 flex flex-col items-center">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

      {/* Name confirmation dialog */}
      {showNameConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-700 transform animate-scaleIn">
            <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-blue-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Certificate Name
            </h2>
            <p className="text-gray-300 mb-5">
              Please confirm how your name should appear on the certificate:
            </p>

            <div className="mb-6">
              <input
                type="text"
                value={certificateName}
                onChange={(e) => setCertificateName(e.target.value)}
                className="w-full bg-gray-700/60 text-white border border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your full name"
              />
              <p className="text-sm text-gray-400 mt-2 italic">
                This name will be displayed on your certificate. Make sure
                it&#39;s spelled correctly.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNameConfirmation(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-300 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleNameConfirmation}
                disabled={isGeneratingCertificate}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white flex items-center transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 shadow-md"
              >
                {isGeneratingCertificate ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Confirm & Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTestDetails && (
        <div className="max-w-2xl w-full bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-xl shadow-2xl border border-gray-700/50 animate-fadeIn">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
            Programming Certification Test
          </h1>
          <div className="text-lg text-gray-300 space-y-4">
            <p>
              Welcome to the Programming Certification Test! This test will evaluate
              your knowledge of React and related concepts.
            </p>
            <p>
              The test consists of {questions.length} questions and you will
              have 30 minutes to complete it.
            </p>
            <p>
              Please ensure that you are in a quiet environment and have a
              stable internet connection before starting the test.
            </p>
            <p>
              Once you start the test, you will not be able to pause or restart
              it. Good luck!
            </p>
          </div>
          <button
            onClick={startTest}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-lg mt-8 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Start Test
          </button>
        </div>
      )}

      {showAgreementDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-700/50 animate-scaleIn">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-yellow-500/90 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-yellow-300 mb-4">
              Test Agreement
            </h2>
            <p className="text-gray-300 mb-4">
              By starting the test, you agree to the following:
            </p>
            <ul className="space-y-2 text-gray-300 mb-6">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                You will not copy or paste any content.
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                You will not use any external resources.
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                You will complete the test in one sitting.
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                You will not exit full-screen mode during the test.
              </li>
            </ul>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowAgreementDialog(false)}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors duration-300 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={agreeToStartTest}
                className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium px-5 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {testStarted && (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <svg
                className="animate-spin h-12 w-12 text-blue-400 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <div className="text-center text-xl font-semibold text-gray-300">
                Loading Your Questions...
              </div>
            </div>
          ) : !result ? (
            <div className="max-w-2xl w-full bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-xl shadow-xl border border-gray-700/50 animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm font-medium text-gray-400">
                  Question {startIndex + 1}-
                  {Math.min(endIndex, questions.length)} of {questions.length}
                </div>
                <div className="flex items-center text-lg font-semibold text-red-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1.5 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatTime(timer)}
                </div>
              </div>

              <div className="w-full bg-gray-700/30 h-2 rounded-full mb-8">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${
                      (Object.keys(answers).length / questions.length) * 100
                    }%`,
                  }}
                ></div>
              </div>

              {paginatedQuestions.map((q, index) => (
                <div
                  key={startIndex + index}
                  className="mb-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                >
                  <h3 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-300">
                    <span className="text-yellow-400 mr-2">
                      {startIndex + index + 1}.
                    </span>{" "}
                    {q.question}
                  </h3>
                  <div className="space-y-3 mt-4">
                    {q.options.map((option) => (
                      <label
                        key={option}
                        className={`block p-3.5 rounded-lg cursor-pointer transition-all duration-200 ease-in-out
                    ${
                      answers[startIndex + index] === option
                        ? "bg-gradient-to-r from-green-600/80 to-emerald-600/80 border-l-4 border-emerald-400 pl-4 transform scale-102 shadow-md"
                        : "bg-gray-700/60 hover:bg-gray-700/90 border-l-4 border-transparent hover:border-gray-500 pl-4"
                    }`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${
                              answers[startIndex + index] === option
                                ? "border-green-300"
                                : "border-gray-500"
                            }`}
                          >
                            {answers[startIndex + index] === option && (
                              <div className="w-2.5 h-2.5 bg-green-300 rounded-full"></div>
                            )}
                          </div>
                          <input
                            type="radio"
                            name={`q${startIndex + index}`}
                            value={option}
                            onChange={() =>
                              handleAnswer(startIndex + index, option)
                            }
                            className="hidden"
                          />
                          <span className="ml-3">{option}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-300 ${
                    currentPage === 1
                      ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                      : "bg-gray-700 hover:bg-gray-600 text-white hover:shadow-md transform hover:scale-105"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>

                <div className="flex items-center">
                  {Array.from({
                    length: Math.ceil(questions.length / questionsPerPage),
                  }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 mx-1 rounded-full flex items-center justify-center transition-all duration-300 ${
                        currentPage === i + 1
                          ? "bg-blue-500 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(questions.length / questionsPerPage)
                      )
                    )
                  }
                  disabled={
                    Object.keys(answers).filter(
                      (k) => k >= startIndex && k < endIndex
                    ).length < paginatedQuestions.length
                  }
                  className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-300 ${
                    Object.keys(answers).filter(
                      (k) => k >= startIndex && k < endIndex
                    ).length < paginatedQuestions.length
                      ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                      : "bg-gray-700 hover:bg-gray-600 text-white hover:shadow-md transform hover:scale-105"
                  }`}
                >
                  Next
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {endIndex >= questions.length &&
                Object.keys(answers).length === questions.length && (
                  <div className="mt-8 pt-6 border-t border-gray-700">
                    <button
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3.5 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Submit Test
                    </button>
                    <p className="text-center text-gray-400 text-sm mt-3">
                      You&apos;ve answered all {questions.length} questions. Good
                      luck!
                    </p>
                  </div>
                )}
            </div>
          ) : (
            <div className="max-w-2xl w-full bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-xl shadow-xl border border-gray-700/50 animate-fadeIn">
              <div className={`bg-gradient-to-br ${result.passed 
                ? "from-blue-900/40 to-purple-900/40 border-blue-700/30" 
                : "from-red-900/30 to-orange-900/30 border-red-800/50"} 
                p-6 rounded-xl border shadow-lg`}>
                <div className="text-center mb-4">
                  <span className={`inline-block w-16 h-16 bg-gradient-to-r ${
                    result.passed 
                      ? "from-blue-500 to-purple-500" 
                      : "from-red-600 to-orange-600"
                    } rounded-full text-white text-2xl font-bold leading-[4rem]`}>
                    {result.passed ? "✓" : "!"}
                  </span>
                </div>
                <h3 className={`text-xl font-bold text-center mb-3 text-transparent bg-clip-text bg-gradient-to-r ${
                  result.passed 
                    ? "from-blue-300 to-purple-300" 
                    : "from-red-300 to-orange-300"}`}>
                  {result.passed ? "Certification Achievement" : "Not Quite There Yet"}
                </h3>
                <p className="text-gray-300 text-center mb-6">
                  {result.passed 
                    ? "Your certificate is ready to be generated and downloaded." 
                    : "You did not pass the certification. Keep learning and try again!"}
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  {result.passed ? (
                    <>
                      <button
                        onClick={openNameConfirmationDialog}
                        disabled={isGeneratingCertificate}
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-md disabled:opacity-70 disabled:hover:scale-100"
                      >
                        📄 Generate Certificate
                      </button>
                      <button
                        onClick={() => setShowConfetti(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-md"
                      >
                        🎉 Celebrate!
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      🔄 Try Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Certifications;
