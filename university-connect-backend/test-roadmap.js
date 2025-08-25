// Test script for the AI Roadmap controller
require('dotenv').config();
const { generateRoadmapWithAI } = require('./controllers/aiRoadmapController');

// Mock user input
const testInput = {
    goals: "Learn Python and create data science projects",
    currentLevel: "Beginner",
    interests: ["Python", "Data Science", "Machine Learning"],
    timeCommitment: "10 hours per week"
};

// Mock user 
const mockUser = {
    _id: "test-user-id-123",
    name: "Test User"
};

// Mock request and response objects
const req = {
    body: testInput,
    user: mockUser
};

const res = {
    status: (code) => {
        console.log(`Response Status: ${code}`);
        return {
            json: (data) => {
                console.log('Response Data:');
                if (data.roadmapData) {
                    console.log('Roadmap Title:', data.roadmapData.metadata?.title);
                    console.log('Roadmap Description:', data.roadmapData.metadata?.description);
                    console.log('First Node Label:', data.roadmapData.nodes?.[0]?.data?.label);
                    
                    // Check if Python is properly used in the title and content
                    const title = data.roadmapData.metadata?.title || '';
                    const firstNodeLabel = data.roadmapData.nodes?.[0]?.data?.label || '';
                    
                    if (title.includes('Python')) {
                        console.log('✅ SUCCESS: Title contains "Python"');
                    } else {
                        console.log('❌ ERROR: Title does not contain "Python":', title);
                    }
                    
                    if (firstNodeLabel.includes('Python')) {
                        console.log('✅ SUCCESS: First node label contains "Python"');
                    } else {
                        console.log('❌ ERROR: First node label does not contain "Python":', firstNodeLabel);
                    }
                } else {
                    console.log(JSON.stringify(data, null, 2));
                }
            }
        };
    }
};

// Import the controller function
const { generateRoadmap } = require('./controllers/aiRoadmapController');

// Execute the test
console.log('🧪 Starting AI Roadmap Controller Test');
console.log('📝 Test Input:', JSON.stringify(testInput, null, 2));

// Make sure API key is set
if (!process.env.PERPLEXITY_API_KEY) {
    console.error('❌ PERPLEXITY_API_KEY environment variable is not set');
    process.exit(1);
}

// Run the controller function
generateRoadmap(req, res)
    .then(() => {
        console.log('✅ Test completed successfully');
    })
    .catch((error) => {
        console.error('❌ Test failed with error:', error);
    });
