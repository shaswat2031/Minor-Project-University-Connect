const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');
const Roadmap = require('../models/Roadmap');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate roadmap using Gemini
async function generateRoadmapWithGemini(userInput) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Create a detailed learning roadmap in JSON format for someone with the following details:
    Current skills: ${userInput.currentSkills.join(', ')}
    Target role: ${userInput.targetRole}
    Timeframe: ${userInput.timeframe}
    Learning style: ${userInput.learningStyle}
    
    Format the response as a JSON object with the following structure:
    {
      "nodes": [
        {
          "id": "unique_id",
          "title": "topic name",
          "description": "brief description",
          "timeEstimate": "estimated time to complete",
          "resources": ["resource1", "resource2"]
        }
      ],
      "edges": [
        {
          "from": "node_id",
          "to": "node_id"
        }
      ]
    }`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return JSON.parse(text);
}

// Create new roadmap
router.post('/', auth, async (req, res) => {
  try {
    const { currentSkills, targetRole, timeframe, learningStyle, title } = req.body;
    
    const roadmapData = await generateRoadmapWithGemini({
      currentSkills,
      targetRole,
      timeframe,
      learningStyle
    });

    const roadmap = new Roadmap({
      userId: req.user.id,
      title,
      currentSkills,
      targetRole,
      timeframe,
      learningStyle,
      roadmapData
    });

    await roadmap.save();
    res.status(201).json(roadmap);
  } catch (error) {
    console.error('Error creating roadmap:', error);
    res.status(500).json({ message: 'Error creating roadmap' });
  }
});

// Get user's roadmaps
router.get('/', auth, async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user.id });
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roadmaps' });
  }
});

// Get specific roadmap
router.get('/:id', auth, async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roadmap' });
  }
});

module.exports = router;
