// Test script to verify the API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing University Connect API endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Health check passed:', healthResponse.data.message);
    
    // Test 2: Try to get coding questions (this will fail without auth, which is expected)
    console.log('\n2. Testing coding questions endpoint (without auth)...');
    try {
      const questionsResponse = await axios.get(`${BASE_URL}/api/admin/coding`);
      console.log('❌ This should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('✅ Authentication required as expected');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.message);
      }
    }

    // Test 3: Try code execution endpoint (without auth)
    console.log('\n3. Testing code execution endpoint (without auth)...');
    try {
      const codeResponse = await axios.post(`${BASE_URL}/api/code/execute`, {
        code: 'console.log("Hello World");',
        language: 'javascript',
        questionId: '507f1f77bcf86cd799439011', // dummy ID
      });
      console.log('❌ This should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('✅ Authentication required as expected');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.message);
      }
    }

    // Test 4: Test Judge0 service health
    console.log('\n4. Testing Judge0 service...');
    try {
      const judge0Response = await axios.get('https://judge0-ce.p.rapidapi.com/submissions', {
        headers: {
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY || '4c9b78c691msh97368a3c7ae2607p1f5585jsnd15998f8ab42'
        }
      });
      console.log('✅ Judge0 service is accessible');
    } catch (error) {
      console.log('❌ Judge0 service error:', error.response?.status, error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
