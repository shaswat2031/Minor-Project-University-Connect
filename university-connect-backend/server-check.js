const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

async function checkServer() {
  console.log("🔍 Checking server health...\n");

  // 1. Check if server is running
  try {
    console.log("1. Testing server connection...");
    const response = await axios.get("http://localhost:5000");
    console.log("✅ Server is responding");
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.log("❌ Server is not running");
      console.log("💡 Start the server with: npm start");
      return;
    }
    console.log("⚠️ Server responded with error:", error.response?.status);
  }

  // 2. Check MongoDB connection
  try {
    console.log("\n2. Testing MongoDB connection...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connection successful");
    await mongoose.disconnect();
  } catch (error) {
    console.log("❌ MongoDB connection failed:", error.message);
    if (error.message.includes("ENOTFOUND")) {
      console.log("💡 Check your internet connection or MongoDB URI");
    }
  }

  // 3. Test auth endpoints
  try {
    console.log("\n3. Testing auth endpoints...");

    // Test registration endpoint
    const testUser = {
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "password123",
    };

    const registerResponse = await axios.post(
      "http://localhost:5000/api/auth/register",
      testUser
    );
    console.log("✅ Registration endpoint working");

    // Test login endpoint
    const loginResponse = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        email: testUser.email,
        password: testUser.password,
      }
    );
    console.log("✅ Login endpoint working");
    console.log("✅ JWT token received:", !!loginResponse.data.token);
  } catch (error) {
    console.log(
      "❌ Auth endpoints error:",
      error.response?.data?.message || error.message
    );
  }

  console.log("\n🎉 Server health check completed!");
}

checkServer().catch(console.error);
