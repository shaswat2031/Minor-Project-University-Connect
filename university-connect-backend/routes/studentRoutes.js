const express = require("express");
const Profile = require("../models/Profile");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Helper function to calculate badge type with validation
function calculateBadgeType(percentage) {
  const validPercentage =
    typeof percentage === "number" && !isNaN(percentage) ? percentage : 0;

  if (validPercentage >= 95) return "platinum";
  if (validPercentage >= 85) return "gold";
  if (validPercentage >= 75) return "silver";
  return "bronze";
}

// Get all students with their profiles
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("Fetching students for user:", req.user.id);

    if (!req.user || !req.user.id) {
      console.error("Invalid user data in request");
      return res.status(401).json({ message: "Invalid authentication data" });
    }

    const loggedInUserId = req.user.id;

    // Validate ObjectId format
    if (!loggedInUserId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error("Invalid user ID format:", loggedInUserId);
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // First, get all users except the logged-in user
    const users = await User.find({
      _id: { $ne: loggedInUserId },
    })
      .select("_id name email")
      .lean();

    console.log(`Found ${users.length} users (excluding current user)`);

    if (users.length === 0) {
      return res.json({
        students: [],
        loggedInUserId,
        total: 0,
      });
    }

    // Get user IDs
    const userIds = users.map((user) => user._id);

    // Get profiles for these users with error handling
    let profiles = [];
    try {
      profiles = await Profile.find({
        user: { $in: userIds },
      })
        .populate("user", "name email")
        .lean();

      console.log(`Found ${profiles.length} profiles`);
    } catch (profileError) {
      console.error("Error fetching profiles:", profileError);
      // Continue with empty profiles array
      profiles = [];
    }

    // Create a map of user ID to profile
    const profileMap = new Map();
    profiles.forEach((profile) => {
      try {
        if (profile.user && profile.user._id) {
          profileMap.set(profile.user._id.toString(), profile);
        }
      } catch (mapError) {
        console.error("Error mapping profile:", mapError);
      }
    });

    // Build student objects combining user data with profile data
    const filteredStudents = users
      .map((user) => {
        try {
          const userId = user._id.toString();
          const profile = profileMap.get(userId);

          // Safely handle certifications
          let certifications = [];
          try {
            certifications = profile?.certifications
              ? Array.isArray(profile.certifications)
                ? profile.certifications
                : []
              : [];
          } catch (certError) {
            console.error("Error processing certifications:", certError);
            certifications = [];
          }

          const certificationStats = {
            totalCertifications: certifications.length,
            categories: certifications
              .map((cert) => {
                try {
                  return cert?.category || null;
                } catch (e) {
                  return null;
                }
              })
              .filter((category) => category),
            badges: certifications.reduce((counts, cert) => {
              try {
                if (cert && typeof cert.percentage === "number") {
                  const badgeType = calculateBadgeType(cert.percentage);
                  counts[badgeType] = (counts[badgeType] || 0) + 1;
                }
              } catch (e) {
                console.error("Error processing badge:", e);
              }
              return counts;
            }, {}),
          };

          return {
            _id: profile?._id || userId,
            user: userId,
            name: profile?.name || user.name || "Unknown User",
            bio: profile?.bio || "",
            skills: Array.isArray(profile?.skills) ? profile.skills : [],
            socialLinks: profile?.socialLinks || {},
            linkedin: profile?.socialLinks?.linkedin || "",
            instagram: profile?.socialLinks?.instagram || "",
            education: Array.isArray(profile?.education)
              ? profile.education
              : [],
            profileImage: profile?.profileImage || "",
            completionPercentage: profile?.completionPercentage || 0,
            certificationStats,
            hasProfile: !!profile,
          };
        } catch (error) {
          console.error("Error processing user:", user._id, error.message);

          // Return safe fallback object
          return {
            _id: user._id,
            user: user._id.toString(),
            name: user.name || "Unknown User",
            bio: "",
            skills: [],
            socialLinks: {},
            linkedin: "",
            instagram: "",
            education: [],
            profileImage: "",
            completionPercentage: 0,
            certificationStats: {
              totalCertifications: 0,
              categories: [],
              badges: {},
            },
            hasProfile: false,
          };
        }
      })
      .filter((student) => student !== null);

    console.log(`Returning ${filteredStudents.length} students`);

    res.json({
      students: filteredStudents,
      loggedInUserId,
      total: filteredStudents.length,
    });
  } catch (error) {
    console.error("Error fetching students - Full error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // More specific error messages based on error type
    let errorMessage = "Unable to fetch students at this time";
    let statusCode = 500;

    if (error.name === "CastError") {
      errorMessage = "Invalid user ID format";
      statusCode = 400;
    } else if (error.name === "ValidationError") {
      errorMessage = "Data validation error";
      statusCode = 400;
    } else if (error.name === "MongoNetworkError") {
      errorMessage = "Database connection error";
      statusCode = 503;
    }

    res.status(statusCode).json({
      message: "Server error",
      error:
        process.env.NODE_ENV === "development" ? error.message : errorMessage,
      ...(process.env.NODE_ENV === "development" && {
        stack: error.stack,
        details: error.message,
        name: error.name,
      }),
    });
  }
});

// Get the logged-in user's profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ user: userId }).select(
      "name skills bio linkedin instagram education"
    );
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get specific student profile with detailed certification info
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const profileId = req.params.id;

    // Validate ObjectId format
    if (!profileId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid profile ID format" });
    }

    const profile = await Profile.findById(profileId).populate(
      "user",
      "name email"
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Safely enhance certifications with badge types
    const certifications = Array.isArray(profile.certifications)
      ? profile.certifications
      : [];

    const enhancedProfile = {
      ...profile.toObject(),
      certifications: certifications.map((cert) => {
        try {
          return {
            ...cert.toObject(),
            badgeType: calculateBadgeType(cert.percentage),
          };
        } catch (error) {
          console.error("Error processing certification:", error);
          return {
            ...cert.toObject(),
            badgeType: "bronze", // fallback
          };
        }
      }),
    };

    res.json(enhancedProfile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
