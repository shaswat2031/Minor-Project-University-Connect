const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Profile = require("../models/Profile");

const router = express.Router();

// Save or Update Profile
router.post("/setup", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      bio,
      skills,
      education,
      experience,
      projects,
      socialLinks,
      location,
      profileImage,
      coverImage,
    } = req.body;

    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
      profile = new Profile({
        user: userId,
        name,
        bio,
        skills: Array.isArray(skills) ? skills : [],
        education: Array.isArray(education) ? education : [],
        experience: Array.isArray(experience) ? experience : [],
        projects: Array.isArray(projects) ? projects : [],
        socialLinks: socialLinks || {},
        location,
        profileImage,
        coverImage,
      });
    } else {
      profile.name = name;
      profile.bio = bio;
      profile.skills = Array.isArray(skills) ? skills : [];
      profile.education = Array.isArray(education) ? education : [];
      profile.experience = Array.isArray(experience) ? experience : [];
      profile.projects = Array.isArray(projects) ? projects : [];
      profile.socialLinks = { ...profile.socialLinks, ...socialLinks };
      profile.location = location;
      if (profileImage) profile.profileImage = profileImage;
      if (coverImage) profile.coverImage = coverImage;
    }

    // Calculate completion percentage
    profile.calculateCompletionPercentage();

    await profile.save();
    res.status(200).json({ message: "Profile saved successfully!", profile });
  } catch (error) {
    console.error("Profile setup error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add certification to profile
router.post("/add-certification", authMiddleware, async (req, res) => {
  try {
    const { category, score, totalQuestions, percentage, certificateId } =
      req.body;
    const userId = req.user.id;

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Check if certification already exists for this category
    const existingCertIndex = profile.certifications.findIndex(
      (cert) => cert.category === category
    );

    const newCertification = {
      category,
      score,
      totalQuestions,
      percentage,
      certificateId,
      earnedAt: new Date(),
    };

    if (existingCertIndex > -1) {
      // Update existing certification if new score is better
      if (percentage > profile.certifications[existingCertIndex].percentage) {
        profile.certifications[existingCertIndex] = newCertification;
      }
    } else {
      // Add new certification
      profile.certifications.push(newCertification);
    }

    // Recalculate completion percentage
    profile.calculateCompletionPercentage();

    await profile.save();
    res
      .status(200)
      .json({ message: "Certification added successfully!", profile });
  } catch (error) {
    console.error("Add certification error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get current user's profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the profile for the authenticated user
    const profile = await Profile.findOne({ user: userId })
      .populate("user", "name email")
      .lean();

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
        hasProfile: false,
        completionPercentage: 0,
      });
    }

    // Calculate completion percentage
    const requiredFields = [
      "name",
      "bio",
      "skills",
      "education",
      "experience",
      "projects",
      "socialLinks",
      "profileImage",
    ];

    let completedFields = 0;
    const totalFields = requiredFields.length;

    // Check each field
    if (profile.name && profile.name.trim()) completedFields++;
    if (profile.bio && profile.bio.trim()) completedFields++;
    if (
      profile.skills &&
      Array.isArray(profile.skills) &&
      profile.skills.length > 0
    )
      completedFields++;
    if (
      profile.education &&
      Array.isArray(profile.education) &&
      profile.education.length > 0
    )
      completedFields++;
    if (
      profile.experience &&
      Array.isArray(profile.experience) &&
      profile.experience.length > 0
    )
      completedFields++;
    if (
      profile.projects &&
      Array.isArray(profile.projects) &&
      profile.projects.length > 0
    )
      completedFields++;
    if (profile.socialLinks && Object.keys(profile.socialLinks).length > 0)
      completedFields++;
    if (profile.profileImage && profile.profileImage.trim()) completedFields++;

    const completionPercentage = Math.round(
      (completedFields / totalFields) * 100
    );
    const isComplete = completionPercentage >= 80; // Consider profile complete at 80%

    // Return the profile with additional metadata
    res.json({
      ...profile,
      hasProfile: true,
      isComplete,
      completionPercentage,
      userId: userId,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get public profile by ID
router.get("/public/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await Profile.findOne({ user: userId })
      .populate("user", "email")
      .select("-user.password");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Increment profile views
    profile.profileViews += 1;
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error("Get public profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
