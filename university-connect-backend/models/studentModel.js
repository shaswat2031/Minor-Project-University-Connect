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
  linkedin: { type: String }, // Added LinkedIn field
  instagram: { type: String }, // Added Instagram field
});

module.exports = mongoose.model("Student", studentSchema);
