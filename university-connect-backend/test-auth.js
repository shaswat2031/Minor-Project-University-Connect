// Simple test file to verify auth routes work
const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/auth";

async function testAuth() {
  try {
    console.log("Testing Auth Routes...\n");

    // Test Registration
    console.log("1. Testing Registration...");
    const registerData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    };

    try {
      const registerResponse = await axios.post(
        `${BASE_URL}/register`,
        registerData
      );
      console.log("✅ Registration successful:", registerResponse.data);
    } catch (error) {
      if (error.response?.data?.message === "User already exists") {
        console.log("ℹ️ User already exists, continuing with login test...");
      } else {
        console.log(
          "❌ Registration failed:",
          error.response?.data?.message || error.message
        );
      }
    }

    // Test Login
    console.log("\n2. Testing Login...");
    const loginData = {
      email: "test@example.com",
      password: "password123",
    };

    try {
      const loginResponse = await axios.post(`${BASE_URL}/login`, loginData);
      console.log("✅ Login successful:", loginResponse.data);

      // Verify token exists
      if (loginResponse.data.token) {
        console.log("✅ JWT token received");
      } else {
        console.log("❌ No JWT token in response");
      }
    } catch (error) {
      console.log(
        "❌ Login failed:",
        error.response?.data?.message || error.message
      );
    }

    // Test Login with wrong credentials
    console.log("\n3. Testing Login with wrong credentials...");
    const wrongLoginData = {
      email: "test@example.com",
      password: "wrongpassword",
    };

    try {
      await axios.post(`${BASE_URL}/login`, wrongLoginData);
      console.log("❌ Login should have failed but succeeded");
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(
          "✅ Login correctly failed with wrong credentials:",
          error.response.data.message
        );
      } else {
        console.log("❌ Unexpected error:", error.message);
      }
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

// Run the test
testAuth();
