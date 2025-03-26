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
    if (timer > 0 && !submitted && testStarted) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !submitted) {
      handleSubmit();
    }
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
        document.removeEventListener("fullscreenchange", handleFullScreenChange);
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
        window.location.href = '/login';
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

      const formattedAnswers = questions.map((q, index) => answers[index] || "");

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
      alert("An error occurred while submitting your answers. Please try again.");
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

  const generateCertificate = (userName, score, totalQuestions) => {
    setIsGeneratingCertificate(true);
    
    try {
      const doc = new jsPDF("landscape");

      doc.setFillColor(240, 240, 240);
      doc.rect(0, 0, 297, 210, "F");

      doc.setDrawColor(50, 90, 160);
      doc.setLineWidth(6);
      doc.rect(10, 10, 277, 190);

      doc.setFont("times", "bold");
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(38);
      doc.text("CERTIFICATE OF ACHIEVEMENT", 148, 50, { align: "center" });

      doc.setFontSize(20);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(80, 80, 80);
      doc.text("This certificate is proudly awarded to", 148, 75, {
        align: "center",
      });

      doc.setFont("cursive", "bolditalic");
      doc.setFontSize(34);
      doc.setTextColor(50, 90, 160);
      doc.text(userName, 148, 100, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(18);
      doc.setTextColor(60, 60, 60);
      doc.text(
        `For securing an outstanding score of ${score}/${totalQuestions} in the React Certification Exam.`,
        148,
        130,
        { align: "center", maxWidth: 270 }
      );

      const issueDate = new Date().toLocaleDateString();
      doc.setFontSize(16);
      doc.setTextColor(120, 120, 120);
      doc.text(`Issued on: ${issueDate}`, 148, 150, { align: "center" });

      doc.setDrawColor(90, 90, 90);
      doc.setLineWidth(1);
      doc.line(100, 180, 190, 180);
      doc.setFont("cursive", "bolditalic");
      doc.setFontSize(16);
      doc.setTextColor(80, 80, 80);
      doc.text("Uni-Conn", 148, 190, { align: "center" });

      doc.setTextColor(200, 200, 200);
      doc.setFontSize(55);
      doc.text("UNIVERSITY CONNECT", 148, 120, {
        align: "center",
        opacity: 0.1,
        rotate: 30,
      });

      doc.save(`${userName}_React_Certificate.pdf`);
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
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      {showConfetti && <Confetti />}

      {/* Name confirmation dialog */}
      {showNameConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full border border-gray-700">
            <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Certificate Name
            </h2>
            <p className="text-gray-300 mb-4">
              Please confirm how your name should appear on the certificate:
            </p>
            
            <div className="mb-6">
              <input
                type="text"
                value={certificateName}
                onChange={(e) => setCertificateName(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
              <p className="text-sm text-gray-400 mt-2">
                This name will be displayed on your certificate. Make sure it&#39;s spelled correctly.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNameConfirmation(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNameConfirmation}
                disabled={isGeneratingCertificate}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center transition-colors disabled:opacity-70"
              >
                {isGeneratingCertificate ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        <div className="max-w-2xl w-full bg-gray-800 p-6 rounded-lg shadow-lg">
          <h1 className="text-4xl font-extrabold text-center mb-6 text-green-400">
            📜 React Certification Test
          </h1>
          <div className="text-lg text-gray-300">
            <p className="mb-4">
              Welcome to the React Certification Test! This test will evaluate
              your knowledge of React and related concepts.
            </p>
            <p className="mb-4">
              The test consists of {questions.length} questions and you will have
              30 minutes to complete it.
            </p>
            <p className="mb-4">
              Please ensure that you are in a quiet environment and have a stable
              internet connection before starting the test.
            </p>
            <p className="mb-4">
              Once you start the test, you will not be able to pause or restart
              it. Good luck!
            </p>
          </div>
          <button
            onClick={startTest}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg mt-6 text-lg font-semibold"
          >
            Start Test
          </button>
        </div>
      )}

      {showAgreementDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-yellow-300 mb-4">
              Agreement
            </h2>
            <p className="text-gray-300 mb-4">
              By starting the test, you agree to the following:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4">
              <li>You will not copy or paste any content.</li>
              <li>You will not use any external resources.</li>
              <li>You will complete the test in one sitting.</li>
              <li>You will not exit full-screen mode during the test.</li>
            </ul>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAgreementDialog(false)}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                onClick={agreeToStartTest}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {testStarted && (
        <>
          {loading ? (
            <div className="text-center text-xl font-semibold text-gray-300 animate-pulse">
              🔄 Loading Questions...
            </div>
          ) : !result ? (
            <div className="max-w-2xl w-full bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-right text-lg font-semibold text-red-400">
                ⏳ Time Left: {formatTime(timer)}
              </div>

              {paginatedQuestions.map((q, index) => (
                <div key={startIndex + index} className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-yellow-300">
                    {q.question}
                  </h3>
                  {q.options.map((option) => (
                    <label
                      key={option}
                      className={`block mt-2 p-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out 
                      ${
                        answers[startIndex + index] === option
                          ? "bg-green-600 scale-105"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q${startIndex + index}`}
                        value={option}
                        onChange={() => handleAnswer(startIndex + index, option)}
                        className="hidden"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ))}

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  ◀ Prev
                </button>
                <span className="text-lg font-semibold">
                  {currentPage} / {Math.ceil(questions.length / questionsPerPage)}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(questions.length / questionsPerPage)
                      )
                    )
                  }
                  disabled={Object.keys(answers).length < endIndex}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Next ▶
                </button>
              </div>

              {endIndex >= questions.length && (
                <button
                  onClick={handleSubmit}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg mt-6 text-lg font-semibold"
                >
                  ✅ Submit Test
                </button>
              )}
            </div>
          ) : (
            <div className="max-w-2xl w-full bg-gray-800 p-8 rounded-lg shadow-lg text-center">
              <h2 className="text-3xl font-bold mb-4">
                <span className={result.passed ? "text-green-400" : "text-red-400"}>
                  {result.passed ? "Congratulations! 🎉" : "Test Completed"}
                </span>
              </h2>
              
              <div className="bg-gray-700 p-6 rounded-lg mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Your Score: {score} / {questions.length}
                </h3>
                <p className="text-lg text-gray-300">
                  {Math.round((score / questions.length) * 100)}% correct
                </p>
              </div>
              
              {result.passed ? (
                <div className="space-y-6">
                  <p className="text-gray-300 text-lg">
                    You&#39;ve successfully passed the React certification test! You can now download your certificate.
                  </p>
                  
                  <div className="mb-6 bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-6 rounded-xl border border-blue-700/30 shadow-lg">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-center mb-3 text-blue-300">Certification Achievement</h3>
                    <p className="text-gray-300 text-center mb-4">Your certificate is ready to be generated and downloaded.</p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <button
                        onClick={openNameConfirmationDialog}
                        disabled={isGeneratingCertificate}
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-md disabled:opacity-70 disabled:hover:scale-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Generate Certificate
                      </button>
                      
                      <button
                        onClick={() => setShowConfetti(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-md"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Celebrate!
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 p-6 rounded-lg border border-red-800 shadow-lg">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-3 text-red-300">Not Quite There Yet</h3>
                  <p className="text-red-300 text-lg mb-4 text-center">
                    You did not pass the certification. Keep learning and try again!
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md flex items-center"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Certifications;