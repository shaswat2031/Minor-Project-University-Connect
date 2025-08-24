require('dotenv').config();
const jwt = require('jsonwebtoken');

// Validate that JWT verification works correctly
console.log('\n=== JWT Verification Test ===');

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not set');
  process.exit(1);
}

// Create a test payload
const payload = { id: 'test-user-id-123' };

// Create a token
console.log('Creating test token with payload:', payload);
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
console.log('Token created:', token.substring(0, 20) + '...');

// Verify the token
try {
  console.log('Verifying token...');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Token verified successfully!');
  console.log('Decoded payload:', decoded);
  console.log('Payload ID:', decoded.id);
  
  if (decoded.id === payload.id) {
    console.log('✅ TEST PASSED: Token verification works correctly');
  } else {
    console.error('❌ TEST FAILED: ID in decoded token does not match original payload');
  }
} catch (error) {
  console.error('❌ TEST FAILED: Token verification failed:', error.message);
}
