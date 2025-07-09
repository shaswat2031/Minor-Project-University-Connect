const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Profile = require("../models/Profile");

const router = express.Router();

// Save or Update Profile
router.post("/setup", authMiddleware, async (req, res) => {
  try {
    const { name, bio, skills, education, linkedin, instagram } = req.body; // Updated fields
    const userId = req.user.id; // Ensure user ID is extracted from the token
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
      profile = new Profile({
        user: userId,
        name,
        bio,
        skills,
        education,
        linkedin,
        instagram,
      }); // Added linkedin and instagram
    } else {
      profile.name = name;
      profile.bio = bio;
      profile.skills = skills;
      profile.education = Array.isArray(education) ? education : []; // Ensure education is an array
      profile.linkedin = linkedin; // Added linkedin
      profile.instagram = instagram; // Added instagram
    }

    await profile.save();
    res.status(200).json({ message: "Profile saved successfully!", profile });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get Profile (Explicitly define /profile route)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Ensure user ID is extracted from the token
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    const profile = await Profile.findOne({ user: userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
