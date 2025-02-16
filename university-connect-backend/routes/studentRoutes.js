const express = require("express");
const Profile = require("../models/Profile");

const router = express.Router();

// Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Profile.find().select("name skills bio");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
