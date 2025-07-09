const axios = require("axios");

const BASE_URL =
  process.env.BASE_URL || "http://localhost:5000/api/certification"; // Singular, not plural
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
    console.log("API URL:", `${BASE_URL}/questions?category=${CATEGORY}`);

    // Create a test token for authentication
    const testToken = "test-token-for-questions";

    const response = await axios.get(
      `${BASE_URL}/questions?category=${CATEGORY}`,
      {
        headers: { Authorization: `Bearer ${testToken}` },
        timeout: 10000, // 10 second timeout
      }
    );
    const questions = response.data;

    if (!questions || questions.length === 0) {
      console.error("❌ Error: No questions found for category", CATEGORY);
      console.log(
        "💡 Tip: Run 'node addmcq.js' to seed the database with questions"
      );
      return null;
    }

    console.log(`✅ ${questions.length} Questions fetched successfully.`);
    console.log(
      "Question types:",
      questions.map((q) => q.type || "unknown")
    );

    // Show sample question
    if (questions[0]) {
      console.log("\n📝 Sample question:");
      if (questions[0].type === "mcq") {
        console.log(`   Q: ${questions[0].question?.substring(0, 60)}...`);
        console.log(`   Options: ${questions[0].options?.length || 0}`);
      } else {
        console.log(`   Title: ${questions[0].title}`);
        console.log(`   Type: Coding question`);
      }
    }

    return questions;
  } catch (error) {
    console.error("❌ Error fetching questions:");

    if (error.code === "ECONNREFUSED") {
      console.log("💡 Tip: Make sure the server is running on port 5000");
      console.log("   Run: npm start (in the backend directory)");
    } else if (error.response) {
      console.log("   Status:", error.response.status);
      console.log(
        "   Message:",
        error.response.data?.message || "Unknown error"
      );
      console.log("   Data:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log("   No response received from server");
      console.log("   Check if server is running and accessible");
    } else {
      console.log("   Error:", error.message);
    }

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

    // Generate answers based on question type
    const answers = {};
    questions.forEach((question, index) => {
      if (question.type === "mcq") {
        // For MCQ questions, pick a random option
        const randomIndex = Math.floor(
          Math.random() * (question.options?.length || 4)
        );
        answers[index] = question.options?.[randomIndex] || "Option A";
      } else if (question.type === "coding") {
        // For coding questions, provide a simple code solution
        answers[index] = `function solution(input) {
  // Test solution for ${question.title || "coding problem"}
  return "test output";
}`;
      } else {
        // Default fallback
        answers[index] = "Test Answer";
      }
    });

    const testToken = "test-token-for-submission";

    const response = await axios.post(
      `${BASE_URL}/submit`,
      {
        ...testUser,
        category: CATEGORY,
        answers: answers,
      },
      {
        headers: { Authorization: `Bearer ${testToken}` },
      }
    );

    console.log(
      "✅ Score:",
      response.data.score,
      "/ " + response.data.totalQuestions
    );
    console.log(
      "✅ MCQ Score:",
      response.data.mcqScore,
      "/ " + response.data.mcqTotal
    );
    console.log("✅ Percentage:", response.data.percentage?.toFixed(1) + "%");
    console.log("✅ Passed:", response.data.passed ? "Yes 🎉" : "No ❌");
    console.log("✅ Badge Type:", response.data.badgeType);

    if (response.data.passed && response.data.certificateUrl) {
      console.log("🏆 Certificate URL:", response.data.certificateUrl);
    }

    if (response.data.certificateId) {
      console.log("📜 Certificate ID:", response.data.certificateId);
    }
  } catch (error) {
    console.error(
      "❌ Error submitting answers:",
      error.response?.data || error.message
    );
  }
}

async function testCertificationEndpoints() {
  try {
    console.log("\n🔍 Testing certification endpoints...");

    const testToken = "test-token-for-submission";
    const testUserId = "68340865fc0d4997275f7ce0"; // Using the userId from your data

    // Test my-certifications endpoint
    console.log("Testing /my-certifications endpoint...");
    try {
      const myCertsResponse = await axios.get(`${BASE_URL}/my-certifications`, {
        headers: { Authorization: `Bearer ${testToken}` },
      });
      console.log("✅ My certifications response:", myCertsResponse.data);
    } catch (error) {
      console.log(
        "❌ My certifications error:",
        error.response?.data || error.message
      );
    }

    // Test user certifications endpoint
    console.log("Testing /user/:userId endpoint...");
    try {
      const userCertsResponse = await axios.get(
        `${BASE_URL}/user/${testUserId}`,
        {
          headers: { Authorization: `Bearer ${testToken}` },
        }
      );
      console.log("✅ User certifications response:", userCertsResponse.data);
    } catch (error) {
      console.log(
        "❌ User certifications error:",
        error.response?.data || error.message
      );
    }
  } catch (error) {
    console.error("❌ Certification endpoints test failed:", error.message);
  }
}

async function testCertificationFlow() {
  console.log("\n🧪 Testing complete certification flow...");

  try {
    // 1. Fetch questions
    const questions = await fetchQuestions();
    if (!questions) return;

    // 2. Submit answers
    await submitAnswers(questions);

    // 3. Test certification retrieval
    console.log("\n🔍 Testing certification retrieval...");

    const testUser = await getTestUser();

    // Test my-certifications endpoint
    const myCertResponse = await axios.get(`${BASE_URL}/my-certifications`, {
      headers: { Authorization: "Bearer test-token-for-submission" },
    });

    console.log("✅ My Certifications:", {
      count: myCertResponse.data.count,
      certifications: myCertResponse.data.certifications?.length || 0,
    });

    // Test user certifications endpoint
    const userCertResponse = await axios.get(
      `${BASE_URL}/user/${testUser.userId}`,
      {
        headers: { Authorization: "Bearer test-token-for-submission" },
      }
    );

    console.log("✅ User Certifications:", {
      count: userCertResponse.data.count,
      userName: userCertResponse.data.userName,
      certifications: userCertResponse.data.certifications?.length || 0,
    });
  } catch (error) {
    console.error(
      "❌ Error in certification flow test:",
      error.response?.data || error.message
    );
  }
}

async function runTest() {
  console.log(`🚀 Starting certification test for ${CATEGORY} category...`);
  console.log(`📡 Server URL: ${BASE_URL}`);

  await testCertificationFlow();
}

runTest();
