const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Profile = require("../models/Profile");

const router = express.Router();

// Save or Update Profile
router.post("/setup", authMiddleware, async (req, res) => {
  try {
    const { name, bio, skills, education, experience } = req.body;
    const userId = req.user.id;

    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
      profile = new Profile({ user: userId, name, bio, skills, education, experience });
    } else {
      profile.name = name;
      profile.bio = bio;
      profile.skills = skills;
      profile.education = education;
      profile.experience = experience;
    }

    await profile.save();
    res.status(200).json({ message: "Profile saved successfully!", profile });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get Profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
