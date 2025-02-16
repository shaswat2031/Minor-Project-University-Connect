import React, { useState, useEffect } from "react";
import { fetchDailyQuestion, submitSolution, fetchLeaderboard } from "../services/questionService";

const QuestionOfTheDay = () => {
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [streak, setStreak] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [questionData, leaderboardData] = await Promise.all([
          fetchDailyQuestion(),
          fetchLeaderboard(),
        ]);
        setQuestion(questionData);
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error("Error loading data:", error);
        setMessage("Failed to load data. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async () => {
    setMessage("");
    const userId = localStorage.getItem("userId");

    if (!userId) return setMessage("Please log in first!");

    if (!code.trim()) return setMessage("Code cannot be empty!");

    try {
      const response = await submitSolution(userId, code, question._id);
      if (response.streak) setStreak(response.streak);
      setMessage(response.message);
    } catch (error) {
      console.error("Submission error:", error);
      setMessage("Submission failed. Try again.");
    }
  };

  return (
    <div className="bg-gray-900 text-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Question of the Day</h2>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : question ? (
        <div>
          <p className="text-lg mb-4">{question.question}</p>
          <textarea
            className="w-full h-40 p-4 text-black rounded-lg border border-gray-700"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your Python code here..."
          ></textarea>
          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition-all"
          >
            Submit
          </button>
        </div>
      ) : (
        <p className="text-red-400">No question available today.</p>
      )}

      {message && <p className="mt-4 text-yellow-300">{message}</p>}

      <h3 className="mt-6 text-2xl">Leaderboard</h3>
      <ul className="mt-2">
        {leaderboard.length > 0 ? (
          leaderboard.map((user, idx) => (
            <li key={idx} className="text-lg">
              {idx + 1}. <span className="font-bold">{user.userId}</span> - {user.streak} streak
            </li>
          ))
        ) : (
          <p className="text-gray-400">No leaderboard data available.</p>
        )}
      </ul>
    </div>
  );
};

export default QuestionOfTheDay;