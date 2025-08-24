const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const aiRoadmapController = require('../controllers/aiRoadmapController');

// ✅ Generate roadmap
router.post('/generate', authMiddleware, (req, res) => {
    console.log('📌 Processing roadmap generation request:', req.body);
    console.log('🔐 Auth user in request:', req.user ? `ID: ${req.user._id}` : 'No user found');
    aiRoadmapController.generateRoadmap(req, res);
});

// ✅ Get roadmap
router.get('/get', authMiddleware, (req, res) => {
    console.log('📌 Processing roadmap retrieval request');
    aiRoadmapController.getRoadmap(req, res);
});

// ✅ Test Perplexity API directly
router.post('/test-perplexity', authMiddleware, async (req, res) => {
    try {
        console.log('📌 Testing Perplexity API with query:', req.body.query);
        
        const url = 'https://api.perplexity.ai/chat/completions';
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar',
                messages: [
                    { role: 'system', content: 'Be precise and concise.' },
                    { role: 'user', content: req.body.query || 'What is a learning roadmap?' }
                ]
            })
        };

        const response = await fetch(url, options);
        const data = await response.json();
        
        // Get userId from authenticated user
        const userId = req.user._id;
        
        res.json({
            success: true,
            response: data,
            userId: userId, // Include userId in response for verification
            apiKey: process.env.PERPLEXITY_API_KEY ? 'Present (first 5 chars: ' + process.env.PERPLEXITY_API_KEY.substring(0, 5) + '...)' : 'Missing'
        });
    } catch (error) {
        console.error('❌ Perplexity API Test Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ✅ Central error handler
router.use((error, req, res, next) => {
    console.error('❌ AI Roadmap Route Error:', error);
    res.status(500).json({
        message: 'Error processing roadmap request',
        error: error.message
    });
});

// ✅ Test the AIRoadmap model creation with proper userId
router.post('/test-model', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('📌 Testing AIRoadmap model creation with userId:', userId);
        
        // Create a sample AIRoadmap document
        const AIRoadmap = require('../models/AIRoadmap');
        const testRoadmap = new AIRoadmap({
            userId: userId,
            goals: 'Test goals',
            currentLevel: 'Beginner',
            interests: ['React', 'JavaScript'],
            timeCommitment: '2 hours per week',
            roadmapData: {
                nodes: [
                    {
                        id: "test_node",
                        type: "topic",
                        data: {
                            label: "Test Node",
                            description: "This is a test node",
                            duration: "1 week",
                            resources: ["https://example.com"],
                            difficulty: "Beginner"
                        },
                        position: { x: 0, y: 0 }
                    }
                ],
                edges: []
            }
        });
        
        // Save the document
        await testRoadmap.save();
        
        res.json({
            success: true,
            message: 'AIRoadmap model test successful',
            roadmap: testRoadmap
        });
    } catch (error) {
        console.error('❌ AIRoadmap Model Test Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
