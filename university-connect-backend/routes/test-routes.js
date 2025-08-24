const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Test route to verify token handling
router.get('/token-test', (req, res) => {
  try {
    console.log('=== Token Test Request ===');
    console.log('Headers:', req.headers);
    
    // Check authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(200).json({
        status: 'no-token',
        message: 'No valid token provided',
        headers: Object.keys(req.headers),
        authHeader: authHeader ? 'present' : 'missing'
      });
    }
    
    // Extract and verify token
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
      
      return res.status(200).json({
        status: 'valid-token',
        decoded,
        userId: decoded.id
      });
    } catch (err) {
      console.error('Token verification error:', err.message);
      
      return res.status(200).json({
        status: 'invalid-token',
        error: err.message,
        token: token.substring(0, 10) + '...',
        jwtSecret: process.env.JWT_SECRET ? 'present (first chars: ' + process.env.JWT_SECRET.substring(0, 5) + '...)' : 'missing'
      });
    }
  } catch (error) {
    console.error('Error in token test endpoint:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Echo route to return request details
router.get('/echo', (req, res) => {
  res.status(200).json({
    method: req.method,
    path: req.path,
    query: req.query,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Test the AI Roadmap API functionality
router.get('/ai-roadmap', async (req, res) => {
  try {
    console.log('Testing AI Roadmap endpoint...');
    res.json({
      message: 'AI Roadmap test route is working!',
      testStatus: 'This endpoint is accessible without authentication or Perplexity API key',
      note: 'Use this to verify your connection to the backend.'
    });
  } catch (error) {
    console.error('Error in AI roadmap test:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router;
