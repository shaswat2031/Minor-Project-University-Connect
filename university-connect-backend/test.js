const axios = require("axios");

const BASE_URL =
  process.env.BASE_URL || "http://localhost:5000/api/certification";
const CATEGORY = process.env.TEST_CATEGORY || "React";

// Get test user from environment or database
const getTestUser = async () => {
  try {
    // Try to get user from environment variables first
    if (process.env.TEST_USER_ID && process.env.TEST_USER_NAME) {
      return {
        userId: process.env.TEST_USER_ID,
        userName: process.env.TEST_USER_NAME,
      };
    }

    // If not available, create a test user or use default
    return {
      userId: "test-user-" + Date.now(),
      userName: "Test User",
    };
  } catch (error) {
    console.error("Error getting test user:", error);
    return null;
  }
};

async function fetchQuestions() {
  try {
    console.log("🔄 Fetching questions...");
    const response = await axios.get(
      `${BASE_URL}/questions?category=${CATEGORY}`
    );
    const questions = response.data;

    if (!questions || questions.length === 0) {
      console.error("❌ Error: No questions found for category", CATEGORY);
      return null;
    }

    console.log(`✅ ${questions.length} Questions fetched successfully.`);
    return questions;
  } catch (error) {
    console.error(
      "❌ Error fetching questions:",
      error.response?.data || error.message
    );
    return null;
  }
}

async function submitAnswers(questions) {
  try {
    const testUser = await getTestUser();
    if (!testUser) {
      console.error("❌ Could not get test user");
      return;
    }

    console.log("🔄 Submitting test answers...");

    // Generate random answers for testing
    const answers = questions.map(() => {
      const randomIndex = Math.floor(Math.random() * 4);
      return questions[0].options[randomIndex] || "Option A";
    });

    const response = await axios.post(`${BASE_URL}/submit`, {
      ...testUser,
      category: CATEGORY,
      answers: answers,
    });

    console.log(
      "✅ Score:",
      response.data.score,
      "/ " + response.data.totalQuestions
    );
    console.log("✅ Passed:", response.data.passed ? "Yes 🎉" : "No ❌");

    if (response.data.passed && response.data.certificateUrl) {
      console.log("🏆 Certificate URL:", response.data.certificateUrl);
    }
  } catch (error) {
    console.error(
      "❌ Error submitting answers:",
      error.response?.data || error.message
    );
  }
}

async function runTest() {
  const questions = await fetchQuestions();
  if (questions) {
    await submitAnswers(questions);
  }
}

runTest();
