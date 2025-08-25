const express = require('express');
const router = express.Router();
const { executeCode, runAllTests } = require('../controllers/codeExecutionController');
const auth = require('../middleware/auth');

// Route to execute code
router.post('/execute', auth, executeCode);

// Route to run all test cases
router.post('/run-tests', auth, runAllTests);

module.exports = router;
