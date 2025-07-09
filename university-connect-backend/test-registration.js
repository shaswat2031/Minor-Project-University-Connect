const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/auth";

async function testRegistration() {
  try {
    console.log("Testing Registration Endpoint...\n");

    // Test Registration with new user
    console.log("1. Testing Registration with new user...");
    const newUser = {
      name: "Test User " + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: "password123",
    };

    console.log("Sending registration request:", {
      name: newUser.name,
      email: newUser.email,
      password: "***",
    });

    try {
      const registerResponse = await axios.post(
        `${BASE_URL}/register`,
        newUser,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      console.log("✅ Registration successful:", registerResponse.data);

      // Test login with newly registered user
      console.log("\n2. Testing login with new user...");
      const loginResponse = await axios.post(`${BASE_URL}/login`, {
        email: newUser.email,
        password: newUser.password,
      });
      console.log("✅ Login successful:", {
        userId: loginResponse.data.userId,
        name: loginResponse.data.name,
        hasToken: !!loginResponse.data.token,
      });
    } catch (error) {
      console.log("❌ Registration failed:");
      if (error.response) {
        console.log("   Status:", error.response.status);
        console.log(
          "   Message:",
          error.response.data?.message || "Unknown error"
        );
        console.log("   Data:", JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.log("   No response received from server");
        console.log("   Check if server is running on port 5000");
      } else {
        console.log("   Error:", error.message);
      }
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

// Run the test
testRegistration();
