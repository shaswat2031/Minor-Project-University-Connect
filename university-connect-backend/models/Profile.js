const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  bio: { type: String, required: true },
  skills: { type: [String], required: true },
  linkedin: { type: String },
  instagram: { type: String },
  education: [
    {
      degree: { type: String },
      institution: { type: String },
      year: { type: String },
    },
  ], // Updated education to be an array of objects
});

module.exports = mongoose.model("Profile", ProfileSchema);
