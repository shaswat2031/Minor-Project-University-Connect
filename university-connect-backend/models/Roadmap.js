const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  currentSkills: [{
    type: String
  }],
  targetRole: {
    type: String,
    required: true
  },
  timeframe: {
    type: String,
    required: true
  },
  learningStyle: {
    type: String,
    required: true
  },
  roadmapData: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
