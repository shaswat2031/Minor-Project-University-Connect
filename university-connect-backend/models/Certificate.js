const mongoose = require("mongoose");

const CertificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  userName: { type: String, required: true },
  category: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  certificateUrl: { type: String },
  passed: { type: Boolean, required: true },
});

module.exports = mongoose.model("Certification", CertificationSchema);
