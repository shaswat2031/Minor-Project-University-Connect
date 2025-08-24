const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Status route to check JWT verification
router.get('/check', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('=== Auth Check ===');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET first 10 chars:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'none');
    console.log('Authorization header:', authHeader ? 'present' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({
        status: 'no-token',
        message: 'No token provided'
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('Token first 10 chars:', token.substring(0, 10) + '...');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
      return res.json({
        status: 'valid',
        decoded
      });
    } catch (err) {
      console.log('Token verification error:', err.message);
      return res.json({
        status: 'invalid',
        error: err.message
      });
    }
  } catch (error) {
    console.error('Error in auth check:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error in auth check',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
