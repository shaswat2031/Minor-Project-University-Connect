const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const aiRoadmapController = require('../controllers/aiRoadmapController');

// ✅ Generate roadmap
router.post('/generate', authMiddleware, (req, res) => {
    console.log('📌 Processing roadmap generation request:', req.body);
    console.log('🔐 Auth user in request:', req.user ? `ID: ${req.user._id}` : 'No user found');
    
    // Validate and process user input
    const { goals, currentLevel, interests, timeCommitment } = req.body;
    
    if (!goals) {
        return res.status(400).json({
            success: false,
            message: 'Please provide your learning goals'
        });
    }
    
    // Convert string interests to array if needed
    if (interests && !Array.isArray(interests)) {
        req.body.interests = interests.split(',').map(item => item.trim());
    }
    
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
        // Extract the main subject from the request body
        const mainSubject = req.body.goals || 'Programming';
        console.log('📌 Testing Perplexity API with query:', req.body.query);
        console.log('📌 Detected main subject:', mainSubject);
        
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
                    { role: 'user', content: req.body.query || `Generate a ${mainSubject} learning roadmap` }
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
        console.log('📌 User input data:', req.body);
        
        // Validate user input
        if (req.body.interests && !Array.isArray(req.body.interests)) {
            req.body.interests = req.body.interests.split(',').map(item => item.trim());
        }
        
        // Create a sample AIRoadmap document
        const AIRoadmap = require('../models/AIRoadmap');
        const testRoadmap = new AIRoadmap({
            userId: userId,
            goals: req.body.goals || 'Learn programming fundamentals',
            currentLevel: req.body.currentLevel || 'Beginner',
            interests: req.body.interests || ['Programming', 'Web Development'],
            timeCommitment: req.body.timeCommitment || '5 hours per week',
            roadmapData: {
                nodes: [
                    {
                        id: "starting_point",
                        type: "topic",
                        data: {
                            label: "Getting Started",
                            description: "Your personalized learning journey begins here",
                            duration: "1 week",
                            resources: ["https://university-connect.com/resources"],
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

// ✅ Test resource validation
router.post('/test-resources', authMiddleware, async (req, res) => {
    try {
        const { subject } = req.body;
        const mainSubject = subject || 'Programming';
        
        console.log('📌 Testing resource validation with subject:', mainSubject);
        
        // Create a sample roadmap with some resources
        const sampleRoadmap = {
            metadata: {
                title: `${mainSubject} Learning Roadmap`,
                description: `Sample roadmap for ${mainSubject} with resources to validate`,
                totalDays: 14
            },
            nodes: [
                {
                    id: "sample_milestone_1",
                    type: "topic",
                    data: {
                        label: `${mainSubject} Basics`,
                        description: "Introduction to the fundamentals",
                        resources: [
                            {
                                title: `${mainSubject} Documentation`,
                                url: "",  // Empty URL to test validation
                                type: "documentation",
                                description: "Official documentation"
                            },
                            {
                                title: `Learn ${mainSubject} on YouTube`,
                                url: "not-a-valid-url",  // Invalid URL to test validation
                                type: "video",
                                description: "Video tutorials"
                            },
                            {
                                title: `${mainSubject} Interactive Exercises`,
                                url: "example.com/no-protocol",  // Missing protocol
                                type: "interactive",
                                description: "Practice exercises"
                            }
                        ],
                        exercises: [
                            {
                                title: `Basic ${mainSubject} Exercise`,
                                description: "Simple exercise to test your knowledge",
                                difficulty: "Easy",
                                link: ""  // Empty link to test validation
                            }
                        ]
                    }
                }
            ]
        };
        
        // Validate the resources
        const validatedRoadmap = aiRoadmapController.validateResourceUrls(sampleRoadmap);
        
        res.json({
            success: true,
            message: 'Resource validation test completed',
            original: sampleRoadmap,
            validated: validatedRoadmap
        });
    } catch (error) {
        console.error('❌ Resource validation test error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
