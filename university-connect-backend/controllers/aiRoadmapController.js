const AIRoadmap = require('../models/AIRoadmap');

// ✅ Ensure API key is set
if (!process.env.PERPLEXITY_API_KEY) {
    console.error('❌ PERPLEXITY_API_KEY is not set in environment variables');
    process.exit(1);
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

        const prompt = `Create a comprehensive React.js learning roadmap as a JSON object with day-by-day structure and theme support.

Input Parameters:
- Goals: ${goals}
- Current Level: ${currentLevel}
- Areas of Interest: ${interests.join(', ')}
- Time Commitment: ${timeCommitment}

IMPORTANT INSTRUCTIONS:
1. Return ONLY a valid, parseable JSON object with NO other text
2. Do NOT include markdown formatting, code blocks, or backticks
3. Do NOT include any explanations
4. All property names must be in double quotes
5. Ensure all strings are properly escaped
6. Your entire response must be ONLY the JSON object
7. Organize content in a day-by-day format (Day 1, Day 2, etc.)
8. Include specific learning resources with links for each topic
9. Support both light and dark themes with appropriate color schemes

JSON Structure:
{
  "metadata": {
    "title": "React.js Learning Roadmap",
    "description": "Personalized roadmap based on user preferences",
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
      "id": "day_1",
      "type": "topic",
      "data": {
        "label": "Day 1: Getting Started with React",
        "description": "Introduction to React fundamentals",
        "content": "Detailed explanation of what to learn on Day 1",
        "exercises": ["Exercise 1", "Exercise 2"],
        "resources": [
          {
            "title": "React Official Documentation",
            "url": "https://react.dev/learn",
            "type": "documentation"
          },
          {
            "title": "Introduction to React Video Tutorial",
            "url": "https://www.youtube.com/watch?v=SqcY0GlETPk",
            "type": "video"
          }
        ],
        "difficulty": "Beginner",
        "estimatedHours": 2
      },
      "position": {"x": 0, "y": 0}
    },
    // more nodes...
  ],
  "edges": [
    {
      "id": "edge_1_2",
      "source": "day_1",
      "target": "day_2",
      "data": {"type": "next_day"}
    },
    // more edges...
  ]
}`;

        const rawText = await generateRoadmapWithAI(prompt);
        console.log('📥 Raw API response length:', rawText.length);
        
        // Print the first 100 and last 100 characters of the response for debugging
        if (rawText.length > 200) {
            console.log('Response start:', rawText.substring(0, 100));
            console.log('Response end:', rawText.substring(rawText.length - 100));
        } else {
            console.log('Full response:', rawText);
        }

        const cleanedText = cleanJsonString(rawText);
        console.log('🧹 Cleaned text length:', cleanedText.length);

        let roadmapData;
        let parseErrorMessage = null;
        try {
            roadmapData = JSON.parse(cleanedText);
            console.log('✅ Successfully parsed JSON');
        } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError.message);
            
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
            
            // Try to create a default roadmap structure
            roadmapData = {
                metadata: {
                    title: "React.js Learning Roadmap",
                    description: "Error parsing AI response. Basic roadmap provided.",
                    totalDays: 7,
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
                        id: "day_1",
                        type: "topic",
                        data: {
                            label: "Day 1: Getting Started with React",
                            description: "Introduction to React basics",
                            content: "Learn the fundamentals of React including components, JSX, and basic rendering.",
                            exercises: ["Create a simple React component", "Render your component to the DOM"],
                            resources: [
                                {
                                    title: "React Official Documentation",
                                    url: "https://react.dev/learn",
                                    type: "documentation"
                                },
                                {
                                    title: "React Tutorial for Beginners",
                                    url: "https://www.youtube.com/watch?v=Ke90Tje7VS0",
                                    type: "video"
                                }
                            ],
                            difficulty: "Beginner",
                            estimatedHours: 2
                        },
                        position: { x: 0, y: 0 }
                    },
                    {
                        id: "day_2",
                        type: "topic",
                        data: {
                            label: "Day 2: React Props and State",
                            description: "Understanding data flow in React",
                            content: "Learn how to use props to pass data between components and manage state within components.",
                            exercises: ["Create components that use props", "Implement state in a component"],
                            resources: [
                                {
                                    title: "React Props and State Guide",
                                    url: "https://react.dev/learn/passing-props-to-a-component",
                                    type: "documentation"
                                },
                                {
                                    title: "State Management in React",
                                    url: "https://www.youtube.com/watch?v=4ORZ1GmjaMc",
                                    type: "video"
                                }
                            ],
                            difficulty: "Beginner",
                            estimatedHours: 3
                        },
                        position: { x: 150, y: 100 }
                    }
                ],
                edges: [
                    {
                        id: "edge_1_2",
                        source: "day_1",
                        target: "day_2",
                        data: { type: "next_day" }
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
    getRoadmap
};
