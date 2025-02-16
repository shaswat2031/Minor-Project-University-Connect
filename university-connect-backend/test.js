const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/certifications/question"; // Change this if your backend runs on a different port
const CATEGORY = "React";
const TEST_USER = {
  userId: "test-user-123",
  userName: "Test User",
};

async function fetchQuestions() {
  try {
    console.log("🔄 Fetching questions...");
    const response = await axios.get(`${BASE_URL}/questions?category=${CATEGORY}`);
    const questions = response.data;

    if (!questions || questions.length !== 30) {
      console.error("❌ Error: Expected 30 questions but got", questions.length);
      return null;
    }

    console.log("✅ 30 Questions fetched successfully.");
    return questions;
  } catch (error) {
    console.error("❌ Error fetching questions:", error.response?.data || error.message);
    return null;
  }
}

async function submitAnswers(questions) {
  try {
    console.log("🔄 Submitting all correct answers...");

    const answers = questions.map(q => q.correctAnswer); // Extract correct answers

    const response = await axios.post(`${BASE_URL}/submit`, {
      ...TEST_USER,
      category: CATEGORY,
      answers: answers,
    });

    console.log("✅ Score:", response.data.score, "/ 30");
    console.log("✅ Passed:", response.data.passed ? "Yes 🎉" : "No ❌");

    if (response.data.passed && response.data.certificateUrl) {
      console.log("🏆 Certificate URL:", response.data.certificateUrl);
    }
  } catch (error) {
    console.error("❌ Error submitting answers:", error.response?.data || error.message);
  }
}

async function runTest() {
  const questions = await fetchQuestions();
  if (questions) {
    await submitAnswers(questions);
  }
}

runTest();
