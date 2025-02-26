import React, { useState, useEffect } from "react";
import {
  fetchCertificationQuestions,
  submitCertificationAnswers,
} from "../api/certification";
import jsPDF from "jspdf";
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

  const questionsPerPage = 5;

  useEffect(() => {
    fetchCertificationQuestions()
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(console.error);
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
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");

    if (!userId || !userName) {
      alert("Please log in first!");
      return;
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
    const passed = percentage >= 65;

    const formattedAnswers = questions.map((q, index) => answers[index] || "");

    const res = await submitCertificationAnswers(
      userId,
      userName,
      "React",
      formattedAnswers
    );

    setResult({ ...res, passed });

    localStorage.removeItem("certificationAnswers");

    // Exit full-screen mode after submission
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error("Failed to exit fullscreen mode:", err);
      });
    }

    // Show confetti if passed
    if (passed) {
      setShowConfetti(true);
    }
  };

  const generateCertificate = (userName, score, totalQuestions) => {
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
            <div className="text-center">
              <h2 className="text-3xl font-bold text-green-400">
                Your Score: {score} / {questions.length}
              </h2>
              {result.passed ? (
                <>
                  <button
                    onClick={() =>
                      generateCertificate(
                        localStorage.getItem("userName"),
                        score,
                        questions.length
                      )
                    }
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg mt-6 inline-block text-lg font-semibold"
                  >
                    🎓 Generate Certificate
                  </button>
                  <button
                    onClick={() => setShowConfetti(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg mt-6 ml-4 inline-block text-lg font-semibold"
                  >
                    🎉 Celebrate!
                  </button>
                </>
              ) : (
                <p className="text-red-400 mt-4 text-lg">
                  ❌ You did not pass. Try again!
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Certifications;