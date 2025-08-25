const mongoose = require('mongoose');

const aiRoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goals: {
    type: String,
    required: true
  },
  currentLevel: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  interests: [{
    type: String
  }],
  timeCommitment: {
    type: String,
    required: true
  },
  roadmapData: {
    type: Object,
    required: true,
    default: () => ({
      metadata: {
        title: "Default Programming Learning Roadmap",
        description: "A fallback roadmap when the AI-generated one couldn't be created",
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
      nodes: [{
        id: "day_1",
        type: "topic",
        data: {
          label: "Day 1: Getting Started",
          description: "This is a fallback node created when proper roadmap data couldn't be generated.",
          content: "Start with the basics, including fundamental concepts and syntax.",
          exercises: [
            {
              title: "Basic Exercise",
              description: "Create your first program or project",
              link: ""
            },
            {
              title: "Practice Challenge",
              description: "Try to solve a simple problem using what you've learned",
              link: ""
            }
          ],
          resources: [
            {
              title: "Official Documentation",
              url: "https://docs.example.com",
              type: "documentation",
              description: "Reference guide for beginners"
            },
            {
              title: "Beginner Tutorial",
              url: "https://www.youtube.com/watch?v=example",
              type: "video",
              description: "Step-by-step video guide for beginners"
            },
            {
              title: "Interactive Learning",
              url: "https://www.freecodecamp.org/example",
              type: "interactive",
              description: "Hands-on practice with guided exercises"
            }
          ],
          difficulty: "Beginner",
          estimatedHours: 2,
          weekEstimate: "1 week at 2-3 hours per week"
        },
        position: { x: 0, y: 0 }
      }],
      edges: []
    })
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  parseError: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('AIRoadmap', aiRoadmapSchema);
