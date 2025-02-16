const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  bio: { type: String, required: true },
  skills: { type: [String], required: true },
  education: [
    {
      degree: String,
      institution: String,
      year: String,
    },
  ],
  experience: [
    {
      company: String,
      role: String,
      duration: String,
    },
  ],
});

module.exports = mongoose.model("Student", studentSchema);
