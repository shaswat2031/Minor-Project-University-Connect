// Test script for resource validation
require('dotenv').config();
const { validateResourceUrls } = require('./controllers/aiRoadmapController');

// Test subject
const testSubject = 'Python';

console.log(`🧪 Testing resource validation for ${testSubject} roadmap`);

// Sample roadmap with various URL issues
const sampleRoadmap = {
    metadata: {
        title: `${testSubject} Learning Roadmap`,
        description: `Test roadmap for ${testSubject} with various URL issues to validate`
    },
    nodes: [
        {
            id: "test_node_1",
            type: "topic",
            data: {
                label: `${testSubject} Basics`,
                description: "Introduction to the fundamentals",
                resources: [
                    {
                        title: `${testSubject} Documentation`,
                        url: "",  // Empty URL
                        type: "documentation",
                        description: "Official documentation"
                    },
                    {
                        title: `Learn ${testSubject} on YouTube`,
                        url: "youtube.com/watch?v=example",  // Missing protocol
                        type: "video",
                        description: "Video tutorials"
                    },
                    {
                        title: `${testSubject} Interactive Exercises`,
                        url: "not-a-valid-url",  // Invalid URL
                        type: "interactive",
                        description: "Practice exercises"
                    },
                    {
                        title: `${testSubject} Community Forum`,
                        url: "https://stackoverflow.com/questions/tagged/python",  // Valid URL
                        type: "community",
                        description: "Community support"
                    },
                    {
                        title: `${testSubject} Best Practices`,
                        url: "example.com/best-practices",  // Missing protocol
                        type: "article",
                        description: "Best practices guide"
                    }
                ],
                exercises: [
                    {
                        title: `Basic ${testSubject} Exercise`,
                        description: "Simple exercise to test your knowledge",
                        difficulty: "Easy",
                        link: ""  // Empty link
                    },
                    {
                        title: `Advanced ${testSubject} Challenge`,
                        description: "Complex problem to solve",
                        difficulty: "Hard",
                        link: "example.org/challenge"  // Missing protocol
                    }
                ]
            }
        }
    ]
};

// Validate the resources
console.log('🔍 Original resource URLs:');
sampleRoadmap.nodes[0].data.resources.forEach(resource => {
    console.log(`- ${resource.title}: ${resource.url}`);
});

console.log('\n🔍 Original exercise links:');
sampleRoadmap.nodes[0].data.exercises.forEach(exercise => {
    console.log(`- ${exercise.title}: ${exercise.link}`);
});

// Run validation
const validatedRoadmap = validateResourceUrls(sampleRoadmap);

console.log('\n✅ Validated resource URLs:');
validatedRoadmap.nodes[0].data.resources.forEach(resource => {
    console.log(`- ${resource.title}: ${resource.url}`);
});

console.log('\n✅ Validated exercise links:');
validatedRoadmap.nodes[0].data.exercises.forEach(exercise => {
    console.log(`- ${exercise.title}: ${exercise.link}`);
});

console.log('\n🧪 Resource validation test complete');
