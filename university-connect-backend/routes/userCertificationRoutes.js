const express = require("express");
const router = express.Router();
const Certification = require("../models/Certification");
const Profile = require("../models/Profile");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * Get user certifications by ID
 * This route is used to fetch certifications for public profiles
 */
router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching certifications for user ID: ${userId}`);

    // Find all certifications for this user that have passed status
    const certifications = await Certification.find({ 
      userId, 
      passed: true 
    }).sort({ createdAt: -1 });

    console.log(`Found ${certifications.length} certifications in Certification collection`);

    // Also try to find the user's profile to get certifications from there as a backup
    const profile = await Profile.findOne({ user: userId });
    
    // If we have certifications in the Certification collection, return those
    if (certifications && certifications.length > 0) {
      return res.json({
        certifications: certifications.map(cert => ({
          _id: cert._id,
          category: cert.category,
          score: cert.score,
          totalQuestions: cert.totalQuestions,
          percentage: cert.percentage,
          certificateId: cert.certificateId,
          badgeType: cert.badgeType,
          certificateUrl: cert.certificateUrl,
          earnedAt: cert.earnedAt || cert.createdAt,
          userName: cert.userName
        })),
        count: certifications.length,
        userName: certifications[0].userName || "User"
      });
    } 
    
    // If no certifications in main collection but profile has certifications
    if (profile && profile.certifications && profile.certifications.length > 0) {
      console.log(`Found ${profile.certifications.length} certifications in Profile collection`);
      
      // Map the profile certifications to the same format as the certification model
      return res.json({
        certifications: profile.certifications.map(cert => ({
          category: cert.category,
          score: cert.score,
          totalQuestions: cert.totalQuestions || 10,
          percentage: cert.percentage,
          certificateId: cert.certificateId,
          badgeType: cert.badgeType,
          earnedAt: cert.earnedAt || new Date(),
          userName: profile.name
        })),
        count: profile.certifications.length,
        userName: profile.name || "User"
      });
    }

    // No certifications found
    return res.json({
      certifications: [],
      count: 0,
      message: "No certifications found for this user"
    });
  } catch (error) {
    console.error("Error fetching user certifications:", error);
    res.status(500).json({ 
      message: "Server Error", 
      error: error.message 
    });
  }
});

module.exports = router;
