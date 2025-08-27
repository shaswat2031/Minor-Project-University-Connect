const express = require('express');
const router = express.Router();
const { executeCode, runAllTests } = require('../controllers/codeExecutionController');
const jwt = require('jsonwebtoken');

// Test-friendly auth middleware (same as certification routes)
const authOrTest = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.replace("Bearer ", "");

  // Allow test tokens for development/testing
  if (
    token === "test-token-for-questions" ||
    token === "test-token-for-submission"
  ) {
    req.user = { id: "test-user-123" };
    return next();
  }

  // Regular JWT verification for production tokens
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Route to execute code
router.post('/execute', authOrTest, executeCode);

// Route to run all test cases
router.post('/run-tests', authOrTest, runAllTests);

module.exports = router;
