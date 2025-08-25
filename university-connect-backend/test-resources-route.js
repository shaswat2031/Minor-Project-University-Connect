// Add this route to the aiRoadmapRoutes.js file

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
        
        // Import and use the validation function from the controller
        const { validateResourceUrls } = require('../controllers/aiRoadmapController');
        
        // Validate the resources
        const validatedRoadmap = validateResourceUrls(sampleRoadmap);
        
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
