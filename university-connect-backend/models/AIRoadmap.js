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
        title: "Default React.js Learning Roadmap",
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
          label: "Day 1: Getting Started with React",
          description: "This is a fallback node created when proper roadmap data couldn't be generated.",
          content: "Start with the basics of React, including component structure and JSX syntax.",
          exercises: ["Create your first React component", "Practice JSX syntax"],
          resources: [
            {
              title: "React Official Documentation",
              url: "https://react.dev/learn",
              type: "documentation"
            },
            {
              title: "Introduction to React Video Tutorial",
              url: "https://www.youtube.com/watch?v=SqcY0GlETPk",
              type: "video"
            }
          ],
          difficulty: "Beginner",
          estimatedHours: 2
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
