const express = require("express");
const Profile = require("../models/Profile");
const authMiddleware = require("../middleware/authMiddleware");
const Student = require("../models/studentModel");

const router = express.Router();

// Get all students
router.get("/", authMiddleware, async (req, res) => {
  try {
    const students = await Profile.find()
      .select("user name skills bio linkedin instagram education"); // Added user field
    const loggedInUserId = req.user.id;
    res.json({ students, loggedInUserId });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get the logged-in user's profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ user: userId }).select("name skills bio linkedin instagram education");
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get specific student profile - Fixed route path
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
