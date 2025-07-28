#!/usr/bin/env node

// Pre-flight check to verify all critical modules can be loaded
console.log("🔍 Running pre-flight checks...");

const criticalModules = [
  "express",
  "mongoose",
  "cors",
  "dotenv",
  "jsonwebtoken",
  "socket.io",
];

// Test bcrypt availability
console.log("\n🔐 Testing bcrypt modules...");
let bcryptAvailable = false;

try {
  require("bcryptjs");
  console.log("✅ bcryptjs is available");
  bcryptAvailable = true;
} catch (error) {
  console.log("❌ bcryptjs is not available:", error.message);
}

try {
  require("bcrypt");
  console.log("✅ bcrypt is available");
  bcryptAvailable = true;
} catch (error) {
  console.log("❌ bcrypt is not available:", error.message);
}

if (!bcryptAvailable) {
  console.error("💥 CRITICAL: No bcrypt implementation available!");
  process.exit(1);
}

// Test other critical modules
console.log("\n📦 Testing other critical modules...");
for (const module of criticalModules) {
  try {
    require(module);
    console.log(`✅ ${module} is available`);
  } catch (error) {
    console.error(`❌ ${module} is not available:`, error.message);
    process.exit(1);
  }
}

// Test our custom bcrypt utility
console.log("\n🛠️ Testing bcrypt utility...");
try {
  const bcryptUtil = require("./utils/bcryptUtil");
  console.log("✅ bcrypt utility loaded successfully");

  // Test hashing (async)
  bcryptUtil
    .hash("test123", 10)
    .then(() => {
      console.log("✅ bcrypt hash function works");
    })
    .catch((error) => {
      console.error("❌ bcrypt hash function failed:", error.message);
      process.exit(1);
    });
} catch (error) {
  console.error("❌ bcrypt utility failed to load:", error.message);
  process.exit(1);
}

console.log("\n✅ All pre-flight checks passed!");
console.log("🚀 Ready to start the server...\n");
