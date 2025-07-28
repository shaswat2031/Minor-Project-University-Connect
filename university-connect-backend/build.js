#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting University Connect Backend Build...");

function runCommand(command, description) {
  try {
    console.log(`\n${description}`);
    execSync(command, { stdio: "inherit" });
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${description}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
}

function checkAndRemove(itemPath, description) {
  try {
    if (fs.existsSync(itemPath)) {
      console.log(`🧹 Removing ${description}...`);
      if (fs.lstatSync(itemPath).isDirectory()) {
        fs.rmSync(itemPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(itemPath);
      }
      console.log(`✅ ${description} removed successfully`);
    } else {
      console.log(`ℹ️ ${description} not found, skipping removal`);
    }
  } catch (error) {
    console.warn(`⚠️ Could not remove ${description}: ${error.message}`);
  }
}

function createDirectory(dirPath, description) {
  try {
    if (!fs.existsSync(dirPath)) {
      console.log(`📁 Creating ${description}...`);
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ ${description} created successfully`);
    } else {
      console.log(`ℹ️ ${description} already exists`);
    }
  } catch (error) {
    console.error(`❌ Failed to create ${description}: ${error.message}`);
    return false;
  }
  return true;
}

function verifyModule(moduleName) {
  try {
    require.resolve(moduleName);
    console.log(`✅ ${moduleName} is available`);
    return true;
  } catch (error) {
    console.log(`❌ ${moduleName} is not available: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    // Display versions
    console.log("\n📋 Environment Information:");
    runCommand("node --version", "Node.js version");
    runCommand("npm --version", "NPM version");

    // Set npm configuration
    console.log("\n🔧 Setting npm configuration...");
    runCommand(
      "npm config set legacy-peer-deps true",
      "Setting legacy peer deps"
    );
    runCommand("npm config set fund false", "Disabling fund messages");
    runCommand("npm config set audit false", "Disabling audit messages");

    // Clear npm cache
    if (!runCommand("npm cache clean --force", "🧹 Clearing npm cache")) {
      console.warn("⚠️ Could not clear npm cache, continuing...");
    }

    // Remove existing installations
    checkAndRemove("node_modules", "existing node_modules");
    checkAndRemove("package-lock.json", "existing package-lock.json");

    // Install dependencies with retry logic
    console.log("\n📦 Installing dependencies...");
    let installSuccess = runCommand(
      "npm install --no-optional --prefer-offline",
      "Installing dependencies (first attempt)"
    );

    if (!installSuccess) {
      console.log("⚠️ First install failed, retrying with fresh cache...");
      runCommand("npm cache clean --force", "Clearing cache again");
      installSuccess = runCommand(
        "npm install --no-optional --no-shrinkwrap",
        "Installing dependencies (retry)"
      );

      if (!installSuccess) {
        throw new Error("Failed to install dependencies after retry");
      }
    }

    // Verify critical packages
    console.log("\n🔍 Verifying critical packages...");

    const criticalPackages = ["bcryptjs", "mongoose", "express", "socket.io"];
    const missingPackages = [];

    for (const pkg of criticalPackages) {
      if (!verifyModule(pkg)) {
        missingPackages.push(pkg);
      }
    }

    // Install missing packages individually
    for (const pkg of missingPackages) {
      console.log(`⚠️ Installing missing package: ${pkg}`);
      const version =
        pkg === "bcryptjs"
          ? "^2.4.3"
          : pkg === "mongoose"
          ? "^8.0.0"
          : "latest";
      runCommand(`npm install ${pkg}@${version} --force`, `Installing ${pkg}`);
    }

    // Create required directories
    createDirectory("certificates", "certificates directory");

    // Test module imports
    console.log("\n🧪 Testing module imports...");

    const testModules = [
      { name: "bcryptjs", test: () => require("bcryptjs") },
      { name: "mongoose", test: () => require("mongoose") },
      { name: "express", test: () => require("express") },
      { name: "socket.io", test: () => require("socket.io") },
    ];

    for (const module of testModules) {
      try {
        module.test();
        console.log(`✅ ${module.name} import successful`);
      } catch (error) {
        console.error(`❌ ${module.name} import failed: ${error.message}`);
        throw new Error(`Critical module ${module.name} failed to load`);
      }
    }

    // Test bcrypt utility if it exists
    try {
      if (fs.existsSync("./utils/bcryptUtil.js")) {
        console.log("\n🛠️ Testing bcrypt utility...");
        const bcryptUtil = require("./utils/bcryptUtil");
        console.log("✅ bcrypt utility loaded successfully");
      }
    } catch (error) {
      console.error(`❌ bcrypt utility test failed: ${error.message}`);
      throw error;
    }

    console.log("\n✅ Build completed successfully!");
    console.log("🚀 Ready to start the server...");
  } catch (error) {
    console.error(`\n💥 Build failed: ${error.message}`);
    process.exit(1);
  }
}

main();
