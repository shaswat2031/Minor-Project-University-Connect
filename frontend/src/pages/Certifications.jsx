import React, { useState, useEffect } from "react";
import {
  fetchCertificationQuestions,
  submitCertificationAnswers,
} from "../api/certification";
import jsPDF from "jspdf";

const Certifications = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(1800); // 30 minutes in seconds

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
    if (timer > 0 && !submitted) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !submitted) {
      handleSubmit();
    }
  }, [timer, submitted]);

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
  };

  const generateCertificate = (userName, score, totalQuestions) => {
    const doc = new jsPDF("landscape"); // 📄 Landscape mode

    // 🎨 **Soft Light Background**
    doc.setFillColor(240, 240, 240); // Light Gray Background
    doc.rect(0, 0, 297, 210, "F");

    // 🎀 **Elegant Border - Soft Navy Blue**
    doc.setDrawColor(50, 90, 160); // Soft Navy Blue
    doc.setLineWidth(6);
    doc.rect(10, 10, 277, 190);

    // 🏆 **Certificate Title - Classic & Bold**
    doc.setFont("times", "bold");
    doc.setTextColor(40, 40, 40); // Dark Gray
    doc.setFontSize(38);
    doc.text("CERTIFICATE OF ACHIEVEMENT", 148, 50, { align: "center" });

    // 📜 **Subtitle - Modern, Clean Look**
    doc.setFontSize(20);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(80, 80, 80);
    doc.text("This certificate is proudly awarded to", 148, 75, {
      align: "center",
    });

    // ✍️ **Recipient Name - Stylish & Unique**
    doc.setFont("cursive", "bolditalic");
    doc.setFontSize(34);
    doc.setTextColor(50, 90, 160); // Soft Navy Blue
    doc.text(userName, 148, 100, { align: "center" });

    // 🎖 **Achievement Details**
    doc.setFont("helvetica", "normal");
    doc.setFontSize(18);
    doc.setTextColor(60, 60, 60);
    doc.text(
      `For securing an outstanding score of ${score}/${totalQuestions} in the React Certification Exam.`,
      148,
      130,
      { align: "center", maxWidth: 270 }
    );

    // 📅 **Issue Date - Subtle & Professional**
    const issueDate = new Date().toLocaleDateString();
    doc.setFontSize(16);
    doc.setTextColor(120, 120, 120);
    doc.text(`Issued on: ${issueDate}`, 148, 150, { align: "center" });

    // ✍️ **Signature - "Uni-Conn"**
    doc.setDrawColor(90, 90, 90);
    doc.setLineWidth(1);
    doc.line(100, 180, 190, 180); // Signature line
    doc.setFont("cursive", "bolditalic");
    doc.setFontSize(16);
    doc.setTextColor(80, 80, 80);
    doc.text("Uni-Conn", 148, 190, { align: "center" });

    // 🌊 **Watermark - Faint & Elegant**
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(55);
    doc.text("UNIVERSITY CONNECT", 148, 120, {
      align: "center",
      opacity: 0.1,
      rotate: 30,
    });

    // 💾 **Save as PDF**
    doc.save(`${userName}_React_Certificate.pdf`);
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
      <h1 className="text-4xl font-extrabold text-center mb-6 text-green-400">
        📜 React Certification Test
      </h1>

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
          ) : (
            <p className="text-red-400 mt-4 text-lg">
              ❌ You did not pass. Try again!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Certifications;
