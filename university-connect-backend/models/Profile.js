const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  bio: { type: String },
  skills: { type: [String] },
  education: [
    {
      degree: String,
      institution: String,
      year: String,
    },
  ],
  experience: [
    {
      role: String,
      company: String,
      duration: String,
    },
  ],
});

// Prevent model overwrite
const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);

module.exports = Profile;
