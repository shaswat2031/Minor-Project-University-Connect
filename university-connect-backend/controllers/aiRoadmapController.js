const AIRoadmap = require('../models/AIRoadmap');

// ✅ Ensure API key is set
if (!process.env.PERPLEXITY_API_KEY) {
    console.error('❌ PERPLEXITY_API_KEY is not set in environment variables');
    process.exit(1);
}

// ✅ Validate and fix resource URLs
function validateResourceUrls(roadmapData) {
    console.log('🔍 Validating resource URLs in roadmap data');
    
    // Skip if roadmapData or nodes is missing
    if (!roadmapData || !roadmapData.nodes || !Array.isArray(roadmapData.nodes)) {
        console.log('⚠️ No nodes found in roadmap data to validate');
        return roadmapData;
    }
    
    // Common URL prefixes to check
    const commonPrefixes = ['http://', 'https://'];
    
    // Default URLs by type if validation fails
    const defaultUrlsByType = {
        'documentation': 'https://developer.mozilla.org/',
        'tutorial': 'https://www.w3schools.com/',
        'video': 'https://www.youtube.com/results?search_query=programming+tutorial',
        'interactive': 'https://www.codecademy.com/',
        'article': 'https://dev.to/',
        'community': 'https://stackoverflow.com/',
        'resource': 'https://github.com/EbookFoundation/free-programming-books'
    };
    
    // Process each node
    roadmapData.nodes.forEach(node => {
        if (node.data && Array.isArray(node.data.resources)) {
            console.log(`🔄 Processing resources for node: ${node.id}`);
            
            node.data.resources.forEach((resource, index) => {
                // Skip if URL is already valid
                if (resource.url && commonPrefixes.some(prefix => resource.url.startsWith(prefix))) {
                    console.log(`✅ Resource ${index + 1} URL is valid: ${resource.url.substring(0, 30)}...`);
                    return;
                }
                
                // Get title words for search query
                const titleWords = resource.title ? resource.title.toLowerCase().split(' ').filter(w => w.length > 3) : [];
                const searchQuery = titleWords.length > 0 ? titleWords.join('+') : 'programming+tutorial';
                
                // Select default URL based on resource type
                let defaultUrl = defaultUrlsByType[resource.type] || 'https://www.google.com/search?q=' + searchQuery;
                
                // Add search query to certain types
                if (resource.type === 'video') {
                    defaultUrl = 'https://www.youtube.com/results?search_query=' + searchQuery;
                } else if (resource.type === 'article') {
                    defaultUrl = 'https://dev.to/search?q=' + searchQuery;
                } else if (resource.type === 'community') {
                    defaultUrl = 'https://stackoverflow.com/search?q=' + searchQuery;
                }
                
                // Update the resource URL
                console.log(`⚠️ Resource ${index + 1} URL is invalid or empty, setting default: ${defaultUrl.substring(0, 30)}...`);
                resource.url = defaultUrl;
            });
            
            // Check exercise links as well
            if (Array.isArray(node.data.exercises)) {
                node.data.exercises.forEach((exercise, index) => {
                    // Skip if link is already valid
                    if (exercise.link && commonPrefixes.some(prefix => exercise.link.startsWith(prefix))) {
                        return;
                    }
                    
                    // Get title words for search query
                    const titleWords = exercise.title ? exercise.title.toLowerCase().split(' ').filter(w => w.length > 3) : [];
                    const searchQuery = titleWords.length > 0 ? titleWords.join('+') : 'programming+exercise';
                    
                    // Determine a default link based on difficulty
                    let defaultLink = 'https://www.google.com/search?q=' + searchQuery;
                    if (exercise.difficulty && exercise.difficulty.toLowerCase().includes('easy')) {
                        defaultLink = 'https://www.w3schools.com/exercises/';
                    } else if (exercise.difficulty && exercise.difficulty.toLowerCase().includes('medium')) {
                        defaultLink = 'https://exercism.org/';
                    } else if (exercise.difficulty && exercise.difficulty.toLowerCase().includes('hard')) {
                        defaultLink = 'https://leetcode.com/problemset/';
                    }
                    
                    // Update the exercise link
                    exercise.link = defaultLink;
                });
            }
        }
    });
    
    console.log('✅ Resource URL validation complete');
    return roadmapData;
}

// ✅ Clean JSON response (remove markdown/code fences)
function cleanJsonString(str) {
    // First remove code blocks and formatting
    let cleaned = str
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/\*\*/g, '')
        .trim();
    
    // Find the first '{' and last '}' to extract just the JSON object
    const startIndex = cleaned.indexOf('{');
    const endIndex = cleaned.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        cleaned = cleaned.substring(startIndex, endIndex + 1);
    }
    
    // Fix common JSON issues
    // 1. Fix unescaped quotes in strings
    cleaned = cleaned.replace(/(?<!\\)\\(?!["\\\/bfnrt])/g, '\\\\');
    
    // 2. Fix missing quotes around property names
    cleaned = cleaned.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
    
    // 3. Ensure quotes are properly paired
    let fixedQuotes = '';
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i];
        
        if (escapeNext) {
            fixedQuotes += char;
            escapeNext = false;
            continue;
        }
        
        if (char === '\\') {
            fixedQuotes += char;
            escapeNext = true;
            continue;
        }
        
        if (char === '"') {
            inString = !inString;
        }
        
        fixedQuotes += char;
    }
    
    // If we end with an unclosed string, add closing quote
    if (inString) {
        fixedQuotes += '"';
    }
    
    return fixedQuotes;
}

// ✅ Generate roadmap using Perplexity AI
async function generateRoadmapWithAI(prompt) {
    try {
        // Using fetch API as in the provided example
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
                    { 
                        role: 'system', 
                        content: 'You are a roadmap generator AI. Generate detailed learning roadmaps in valid JSON format only. Do not include any explanatory text, markdown formatting, or code block indicators like ```json or ```. Your entire response must be a valid, parseable JSON object and nothing else.' 
                    },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 2048,
                temperature: 0.5
            })
        };

        console.log("🚀 Sending request to Perplexity:", JSON.stringify(options.body, null, 2));

        const response = await fetch(url, options);
        const data = await response.json();
        
        console.log("📊 Perplexity API Response received");

        if (!data.choices || !data.choices[0].message) {
            throw new Error('Invalid response format from Perplexity API');
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error('❌ Perplexity API Error:', JSON.stringify(error.response?.data || error.message, null, 2));
        throw new Error('Failed to generate roadmap: ' + (error.response?.data?.error || error.message));
    }
}

// ✅ Main controller: generate roadmap
async function generateRoadmap(req, res) {
    try {
        const { goals, currentLevel, interests = [], timeCommitment } = req.body;
        
        // Check if user exists in the request
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "User not authenticated or user ID missing" });
        }
        
        const userId = req.user._id;
        console.log('👤 User ID from request:', userId);

        // Determine the main subject from interests or goals
        let mainSubject = "programming";
        
        // First try to extract from interests
        if (Array.isArray(interests) && interests.length > 0) {
            mainSubject = interests[0].trim();
            console.log('📌 Main subject extracted from interests:', mainSubject);
        } 
        // Then try to extract from goals if it contains "learn X" pattern
        else if (goals) {
            const learnMatch = goals.toLowerCase().match(/learn\s+([a-z0-9\s]+)/i);
            if (learnMatch && learnMatch[1]) {
                // Extract the first word after "learn"
                mainSubject = learnMatch[1].trim().split(/\s+/)[0];
                console.log('📌 Main subject extracted from "learn X" pattern:', mainSubject);
            } else {
                // If no "learn X" pattern, just take the first meaningful word
                const words = goals.split(/\s+/).filter(w => w.length > 3);
                if (words.length > 0) {
                    mainSubject = words[0].trim();
                    console.log('📌 Main subject extracted from first word in goals:', mainSubject);
                }
            }
        }
        
        // Validate and clean the mainSubject to ensure it's safe to use
        mainSubject = mainSubject
            .replace(/[^\w\s]/gi, '') // Remove special characters
            .trim(); // Remove extra spaces
            
        // If the subject is empty or too short after cleaning, use a default
        if (!mainSubject || mainSubject.length < 2) {
            mainSubject = "Programming";
            console.log('⚠️ Invalid subject detected, using default:', mainSubject);
        }
        
        // Capitalize the first letter
        mainSubject = mainSubject.charAt(0).toUpperCase() + mainSubject.slice(1).toLowerCase();
        console.log('🔍 Final cleaned main subject:', mainSubject);

        // Build the prompt directly without template strings that might cause issues
        const promptStart = "Create a comprehensive " + mainSubject + " learning roadmap as a JSON object with a step-by-step structure, detailed resources, and theme support.\n\n";
        
        const inputParams = "Input Parameters:\n" +
            "- Goals: " + (goals || 'Become proficient in ' + mainSubject) + "\n" +
            "- Current Level: " + (currentLevel || 'Beginner') + "\n" +
            "- Areas of Interest: " + (Array.isArray(interests) ? interests.join(', ') : interests || mainSubject) + "\n" +
            "- Time Commitment: " + (timeCommitment || '10 hours per week') + "\n\n";
        
        const instructions = `IMPORTANT INSTRUCTIONS:
1. Return ONLY a valid, parseable JSON object with NO other text
2. Do NOT include markdown formatting, code blocks, or backticks
3. Do NOT include any explanations
4. All property names must be in double quotes
5. Ensure all strings are properly escaped
6. Your entire response must be ONLY the JSON object
7. Organize content in a progressive step-by-step format with clear milestones:
   - 4-6 clearly defined milestones that build upon each other
   - Each milestone should focus on a specific skill or concept area
   - Include a concise description and detailed content explaining key concepts
   - Ensure natural progression from beginner concepts to more advanced topics
8. For EACH topic/milestone, include exactly 5 diverse high-quality learning resources with:
   - Direct links to official documentation (REAL URLs like docs.python.org, developer.mozilla.org, etc.)
   - Free tutorial websites (REAL URLs from freeCodeCamp, MDN, W3Schools, etc.)
   - Video courses with SPECIFIC and WORKING YouTube links (full URLs starting with https://www.youtube.com/)
   - Interactive practice platforms (REAL URLs from Codecademy, LeetCode, etc.)
   - Beginner-friendly articles from trusted sources (REAL URLs from Medium, Dev.to, etc.)
   - Each resource MUST include a descriptive title, ACTUAL working URL (not placeholder URLs), resource type, and a 1-2 sentence description explaining what the learner will gain
   - DO NOT use placeholder URLs like example.com, instead use real websites relevant to ${mainSubject}
9. Add realistic time estimates for each milestone:
   - Include both total hours required and calendar time (e.g., "10 hours, approximately 2 weeks at 5 hours/week")
   - Base estimates on the user's stated time commitment
   - Consider difficulty level when calculating time estimates (beginners need more time)
10. Include 2-3 specific practice exercises or mini-projects for each milestone with:
    - Clear title describing the exercise
    - Detailed description explaining what to build
    - Difficulty level (Easy, Medium, Hard)
    - Direct link to starter code or instructions if available (MUST be REAL working URLs)
    - Expected completion time
11. Tailor content based on user's current level:
    - For 'Beginner': More fundamentals, detailed explanations, basic concepts
    - For 'Intermediate': Assume basic knowledge, focus on practical applications and more advanced concepts
    - For 'Advanced': Focus on optimization, best practices, architecture, and expert-level topics
12. Support both light and dark themes with appropriate color schemes

JSON Structure Example (adapt for ${mainSubject}):`;

        // Create a JSON structure example specific to the mainSubject
        const jsonStructureExample = `
{
  "metadata": {
    "title": "${mainSubject} Learning Roadmap",
    "description": "Personalized ${mainSubject} roadmap based on user preferences",
    "totalDays": 30,
    "themes": {
      "light": {
        "background": "#FFFFFF",
        "text": "#333333",
        "primary": "#4287f5",
        "secondary": "#42c5f5",
        "accent": "#f54242",
        "nodeBackground": "#f0f8ff",
        "nodeBorder": "#87CEFA",
        "edgeColor": "#A9A9A9"
      },
      "dark": {
        "background": "#1a1a1a",
        "text": "#FFFFFF",
        "primary": "#61dafb",
        "secondary": "#bb86fc",
        "accent": "#03dac6",
        "nodeBackground": "#2d2d2d",
        "nodeBorder": "#3a506b",
        "edgeColor": "#6c757d"
      }
    }
  },
  "nodes": [
    {
      "id": "milestone_1",
      "type": "topic",
      "data": {
        "label": "Milestone 1: ${mainSubject} Fundamentals",
        "description": "Learn the basic concepts and principles of ${mainSubject}",
        "content": "Detailed explanation of fundamental ${mainSubject} concepts including key terminology, basic syntax, and core principles that will form the foundation of your learning journey.",
        "exercises": [
          {
            "title": "Build Your First ${mainSubject} Project", 
            "description": "Create a simple application that demonstrates the basic concepts you've learned. Focus on implementing fundamental principles in a practical way.",
            "difficulty": "Easy",
            "estimatedTime": "2-3 hours",
            "link": ""
          },
          {
            "title": "Interactive Challenge: ${mainSubject} Basics",
            "description": "Complete a series of exercises that test your understanding of the core concepts covered in this milestone.",
            "difficulty": "Easy to Medium",
            "estimatedTime": "1-2 hours",
            "link": ""
          }
        ],
        "resources": [
          {
            "title": "Official ${mainSubject} Documentation",
            "url": "",
            "type": "documentation",
            "description": "The authoritative reference guide for ${mainSubject}, covering all fundamental concepts with detailed explanations and examples."
          },
          {
            "title": "${mainSubject} for Beginners - Video Tutorial Series",
            "url": "",
            "type": "video",
            "description": "A comprehensive step-by-step video course that covers all the basics of ${mainSubject} with practical demonstrations."
          },
          {
            "title": "Interactive ${mainSubject} Learning Platform",
            "url": "",
            "type": "interactive",
            "description": "Hands-on platform where you can practice ${mainSubject} concepts through interactive exercises and receive immediate feedback."
          },
          {
            "title": "Beginner's Guide to ${mainSubject}",
            "url": "",
            "type": "article",
            "description": "A well-structured introduction to ${mainSubject} that explains core concepts in an easy-to-understand manner with practical examples."
          },
          {
            "title": "${mainSubject} Cheat Sheet for Quick Reference",
            "url": "",
            "type": "resource",
            "description": "A comprehensive reference sheet that summarizes all the essential ${mainSubject} syntax, methods, and concepts for easy review."
          }
        ],
        "difficulty": "Beginner",
        "estimatedHours": 10,
        "weekEstimate": "2 weeks at 5 hours/week"
      }
    }
  ]
}`;
        
        // Replace all template placeholders in the JSON structure
        const fixedJsonStructure = jsonStructureExample.replace(/\${mainSubject}/g, mainSubject);
        
        // Combine all parts of the prompt
        const fullPrompt = promptStart + inputParams + instructions + fixedJsonStructure;
        
        // Debug logs
        console.log('📝 Building prompt for ' + mainSubject + ' roadmap');
        console.log('📝 First 200 chars of prompt:', fullPrompt.substring(0, 200));

        // Send to API
        const rawText = await generateRoadmapWithAI(fullPrompt);
        console.log('📥 Raw API response length:', rawText.length);
        
        // Print the first 200 and last 100 characters of the response for debugging
        if (rawText.length > 300) {
            console.log('Response start:', rawText.substring(0, 200));
            console.log('Response end:', rawText.substring(rawText.length - 100));
        } else {
            console.log('Full response:', rawText);
        }

        const cleanedText = cleanJsonString(rawText);
        console.log('🧹 Cleaned text length:', cleanedText.length);
        console.log('🧹 First 100 chars of cleaned text:', cleanedText.substring(0, 100));

        let roadmapData;
        let parseErrorMessage = null;
        try {
            roadmapData = JSON.parse(cleanedText);
            console.log('✅ Successfully parsed JSON');
            
            // Verify if the title uses the correct subject
            if (roadmapData.metadata && roadmapData.metadata.title) {
                if (!roadmapData.metadata.title.includes(mainSubject)) {
                    console.log('⚠️ API returned incorrect title, fixing it');
                    roadmapData.metadata.title = mainSubject + ' Learning Roadmap';
                }
            }
            
            // Validate and fix resource URLs
            roadmapData = validateResourceUrls(roadmapData);
            
        } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError.message);
            parseErrorMessage = parseError.message;
            
            // Provide detailed error location information
            const errorPosition = parseInt(parseError.message.match(/position (\d+)/)?.[1]);
            if (errorPosition) {
                const errorContext = cleanedText.substring(
                    Math.max(0, errorPosition - 20),
                    Math.min(cleanedText.length, errorPosition + 20)
                );
                console.error(`Error context: "${errorContext}"`);
                console.error(`Error at position ${errorPosition}`);
            }
            
            // Try to create a default roadmap structure using the detected mainSubject
            console.log('⚠️ Creating fallback roadmap for subject:', mainSubject);
            
            // Set up URLs based on the subject
            let docsUrl, tutorialUrl, communityUrl, practiceUrl, videoUrl;
            
            // Determine URLs based on common subjects
            switch(mainSubject.toLowerCase()) {
                case 'python':
                    docsUrl = "https://docs.python.org/3/";
                    tutorialUrl = "https://www.w3schools.com/python/";
                    practiceUrl = "https://www.codecademy.com/learn/learn-python-3";
                    videoUrl = "https://www.youtube.com/watch?v=_uQrJ0TkZlc";
                    communityUrl = "https://realpython.com/";
                    break;
                case 'javascript':
                    docsUrl = "https://developer.mozilla.org/en-US/docs/Web/JavaScript";
                    tutorialUrl = "https://javascript.info/";
                    practiceUrl = "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/";
                    videoUrl = "https://www.youtube.com/watch?v=PkZNo7MFNFg";
                    communityUrl = "https://dev.to/t/javascript";
                    break;
                case 'react':
                case 'reactjs':
                    docsUrl = "https://react.dev/";
                    tutorialUrl = "https://www.w3schools.com/react/";
                    practiceUrl = "https://scrimba.com/learn/learnreact";
                    videoUrl = "https://www.youtube.com/watch?v=bMknfKXIFA8";
                    communityUrl = "https://dev.to/t/react";
                    break;
                case 'java':
                    docsUrl = "https://docs.oracle.com/en/java/";
                    tutorialUrl = "https://www.w3schools.com/java/";
                    practiceUrl = "https://www.codecademy.com/learn/learn-java";
                    videoUrl = "https://www.youtube.com/watch?v=eIrMbAQSU34";
                    communityUrl = "https://www.baeldung.com/";
                    break;
                case 'c++':
                case 'cpp':
                    docsUrl = "https://en.cppreference.com/w/";
                    tutorialUrl = "https://www.learncpp.com/";
                    practiceUrl = "https://www.hackerrank.com/domains/cpp";
                    videoUrl = "https://www.youtube.com/watch?v=vLnPwxZdW4Y";
                    communityUrl = "https://stackoverflow.com/questions/tagged/c%2B%2B";
                    break;
                default:
                    // Generic tech learning resources
                    docsUrl = `https://www.google.com/search?q=${mainSubject.toLowerCase()}+documentation`;
                    tutorialUrl = `https://www.w3schools.com/`;
                    practiceUrl = "https://www.codecademy.com/";
                    videoUrl = `https://www.youtube.com/results?search_query=${mainSubject.toLowerCase()}+tutorial+for+beginners`;
                    communityUrl = `https://dev.to/search?q=${mainSubject.toLowerCase()}`;
            }
            
            roadmapData = {
                metadata: {
                    title: `${mainSubject} Learning Roadmap`,
                    description: `Comprehensive ${mainSubject} learning roadmap with structured milestones, resources, and practice exercises.`,
                    totalDays: 30,
                    themes: {
                        light: {
                            background: "#FFFFFF",
                            text: "#333333",
                            primary: "#4287f5",
                            secondary: "#42c5f5",
                            accent: "#f54242",
                            nodeBackground: "#f0f8ff",
                            nodeBorder: "#87CEFA",
                            edgeColor: "#A9A9A9"
                        },
                        dark: {
                            background: "#1a1a1a",
                            text: "#FFFFFF",
                            primary: "#61dafb",
                            secondary: "#bb86fc",
                            accent: "#03dac6",
                            nodeBackground: "#2d2d2d",
                            nodeBorder: "#3a506b",
                            edgeColor: "#6c757d"
                        }
                    }
                },
                nodes: [
                    {
                        id: "milestone_1",
                        type: "topic",
                        data: {
                            label: `Milestone 1: ${mainSubject} Fundamentals`,
                            description: `Introduction to ${mainSubject} basics and core concepts`,
                            content: `Learn the fundamentals of ${mainSubject} including core concepts, basic syntax, and essential principles. This milestone will establish a solid foundation for your learning journey by covering the key terminology and basic operations that all ${mainSubject} developers need to understand.`,
                            exercises: [
                                {
                                    title: `Build Your First ${mainSubject} Project`,
                                    description: `Create a simple ${mainSubject} application that demonstrates the basic concepts you've learned. Focus on implementing the fundamental principles in a practical way.`,
                                    difficulty: "Easy",
                                    estimatedTime: "2-3 hours",
                                    link: practiceUrl
                                },
                                {
                                    title: `${mainSubject} Fundamentals Quiz`,
                                    description: `Test your understanding of core ${mainSubject} concepts through this interactive quiz that covers all the essential topics from this milestone.`,
                                    difficulty: "Easy",
                                    estimatedTime: "30 minutes",
                                    link: ""
                                }
                            ],
                            resources: [
                                {
                                    title: `Official ${mainSubject} Documentation`,
                                    url: docsUrl,
                                    type: "documentation",
                                    description: `The authoritative reference guide for ${mainSubject}, covering all fundamental concepts with detailed explanations and examples.`
                                },
                                {
                                    title: `${mainSubject} Tutorial for Beginners`,
                                    url: tutorialUrl,
                                    type: "tutorial",
                                    description: `A comprehensive step-by-step tutorial that covers all the basics of ${mainSubject} with practical examples and exercises.`
                                },
                                {
                                    title: `${mainSubject} Video Course for Beginners`,
                                    url: videoUrl,
                                    type: "video",
                                    description: `Visual learning resource that walks you through ${mainSubject} fundamentals with demonstrations and explanations.`
                                },
                                {
                                    title: `Interactive ${mainSubject} Practice Platform`,
                                    url: practiceUrl,
                                    type: "interactive",
                                    description: `Hands-on platform where you can practice ${mainSubject} concepts through interactive exercises and receive immediate feedback.`
                                },
                                {
                                    title: `${mainSubject} Community Articles and Tutorials`,
                                    url: communityUrl,
                                    type: "community",
                                    description: `Collection of articles, tutorials, and guides from the ${mainSubject} community covering a wide range of fundamental topics.`
                                }
                            ],
                            difficulty: "Beginner",
                            estimatedHours: 10,
                            weekEstimate: "2 weeks at 5 hours per week"
                        },
                        position: { x: 0, y: 0 }
                    },
                    {
                        id: "milestone_2",
                        type: "topic",
                        data: {
                            label: `Milestone 2: Intermediate ${mainSubject} Concepts`,
                            description: `Building on fundamentals with more advanced ${mainSubject} techniques`,
                            content: `Take your ${mainSubject} skills to the next level by learning intermediate concepts and techniques. This milestone builds upon the fundamentals and introduces more complex topics that will enhance your ability to develop sophisticated ${mainSubject} applications.`,
                            exercises: [
                                {
                                    title: `${mainSubject} Mini-Project`,
                                    description: `Create a more comprehensive ${mainSubject} project that incorporates intermediate concepts and demonstrates your growing proficiency.`,
                                    difficulty: "Medium",
                                    estimatedTime: "4-6 hours",
                                    link: ""
                                },
                                {
                                    title: `${mainSubject} Coding Challenges`,
                                    description: `Solve a set of coding challenges that require applying intermediate ${mainSubject} concepts to reinforce your learning.`,
                                    difficulty: "Medium",
                                    estimatedTime: "2-3 hours",
                                    link: "https://www.hackerrank.com/"
                                }
                            ],
                            resources: [
                                {
                                    title: `Intermediate ${mainSubject} Techniques`,
                                    url: docsUrl,
                                    type: "documentation",
                                    description: `Advanced sections of the official documentation covering more complex ${mainSubject} concepts and best practices.`
                                },
                                {
                                    title: `${mainSubject} Project Tutorials`,
                                    url: tutorialUrl,
                                    type: "tutorial",
                                    description: `Step-by-step tutorials for building real-world projects with ${mainSubject} to apply your intermediate knowledge.`
                                },
                                {
                                    title: `${mainSubject} Advanced Video Course`,
                                    url: videoUrl,
                                    type: "video",
                                    description: `Comprehensive video tutorials covering more advanced ${mainSubject} topics with detailed explanations and examples.`
                                },
                                {
                                    title: `${mainSubject} Best Practices Guide`,
                                    url: communityUrl,
                                    type: "article",
                                    description: `Compilation of industry best practices for writing efficient, maintainable, and scalable ${mainSubject} code.`
                                },
                                {
                                    title: `Interactive ${mainSubject} Challenges`,
                                    url: "https://www.codewars.com/",
                                    type: "interactive",
                                    description: `Platform with progressively challenging ${mainSubject} problems to test and improve your skills through practical application.`
                                }
                            ],
                            difficulty: "Intermediate",
                            estimatedHours: 15,
                            weekEstimate: "3 weeks at 5 hours per week"
                        },
                        position: { x: 200, y: 100 }
                    }
                ],
                edges: [
                    {
                        id: "edge_1_2",
                        source: "milestone_1",
                        target: "milestone_2",
                        data: { type: "next_milestone" }
                    }
                ]
            };
            
            parseErrorMessage = parseError.message;
            console.log('⚠️ Using default roadmap structure due to parsing error');
        }

        // Ensure all required fields are present
        if (!userId) {
            throw new Error('userId is required for roadmap creation');
        }
        
        if (!goals) {
            throw new Error('goals are required for roadmap creation');
        }
        
        if (!currentLevel) {
            throw new Error('currentLevel is required for roadmap creation');
        }
        
        if (!timeCommitment) {
            throw new Error('timeCommitment is required for roadmap creation');
        }

        console.log('📦 Creating new roadmap with userId:', userId);
        
        const newRoadmap = new AIRoadmap({
            userId,
            goals,
            currentLevel,
            interests,
            timeCommitment,
            roadmapData,
            parseError: parseErrorMessage
        });

        await newRoadmap.save();
        res.status(200).json(newRoadmap);
    } catch (error) {
        console.error('❌ Error in generateRoadmap:', error);
        res.status(500).json({ message: error.message });
    }
}

// ✅ Controller: get roadmap
async function getRoadmap(req, res) {
    try {
        const userId = req.user._id;
        const roadmap = await AIRoadmap.findOne({ userId }).sort({ createdAt: -1 });

        if (!roadmap) {
            return res.status(404).json({ message: 'No roadmap found' });
        }

        res.status(200).json(roadmap);
    } catch (error) {
        console.error('❌ Error in getRoadmap:', error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    generateRoadmap,
    getRoadmap,
    validateResourceUrls
};
