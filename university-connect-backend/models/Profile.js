const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    education: [
      {
        degree: {
          type: String,
          trim: true,
        },
        institution: {
          type: String,
          trim: true,
        },
        fieldOfStudy: {
          type: String,
          trim: true,
        },
        startYear: {
          type: String,
          trim: true,
        },
        endYear: {
          type: String,
          trim: true,
        },
        grade: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        current: {
          type: Boolean,
          default: false,
        },
      },
    ],
    experience: [
      {
        title: {
          type: String,
          trim: true,
        },
        company: {
          type: String,
          trim: true,
        },
        location: {
          type: String,
          trim: true,
        },
        startDate: {
          type: String,
          trim: true,
        },
        endDate: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        current: {
          type: Boolean,
          default: false,
        },
      },
    ],
    projects: [
      {
        title: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        technologies: [
          {
            type: String,
            trim: true,
          },
        ],
        githubUrl: {
          type: String,
          trim: true,
        },
        liveUrl: {
          type: String,
          trim: true,
        },
        startDate: {
          type: String,
          trim: true,
        },
        endDate: {
          type: String,
          trim: true,
        },
        featured: {
          type: Boolean,
          default: false,
        },
      },
    ],
    socialLinks: {
      linkedin: {
        type: String,
        trim: true,
      },
      github: {
        type: String,
        trim: true,
      },
      twitter: {
        type: String,
        trim: true,
      },
      instagram: {
        type: String,
        trim: true,
      },
      portfolio: {
        type: String,
        trim: true,
      },
    },
    profileImage: {
      type: String,
      trim: true,
    },
    photos: [
      {
        url: {
          type: String,
          trim: true,
        },
        caption: {
          type: String,
          trim: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    certifications: [
      {
        title: {
          type: String,
          trim: true,
        },
        issuer: {
          type: String,
          trim: true,
        },
        issueDate: {
          type: String,
          trim: true,
        },
        expiryDate: {
          type: String,
          trim: true,
        },
        credentialId: {
          type: String,
          trim: true,
        },
        credentialUrl: {
          type: String,
          trim: true,
        },
        category: {
          type: String,
          trim: true,
        },
        percentage: {
          type: Number,
          min: 0,
          max: 100,
        },
        score: {
          type: Number,
        },
        totalQuestions: {
          type: Number,
        },
        badgeType: {
          type: String,
          enum: ["bronze", "silver", "gold", "platinum"],
        },
        certificateId: {
          type: String,
          trim: true,
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update lastUpdated on save
profileSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

// Method to calculate completion percentage
profileSchema.methods.calculateCompletionPercentage = function () {
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
  if (this.name && this.name.trim()) completedFields++;
  if (this.bio && this.bio.trim()) completedFields++;
  if (this.skills && Array.isArray(this.skills) && this.skills.length > 0)
    completedFields++;
  if (
    this.education &&
    Array.isArray(this.education) &&
    this.education.length > 0
  )
    completedFields++;
  if (
    this.experience &&
    Array.isArray(this.experience) &&
    this.experience.length > 0
  )
    completedFields++;
  if (this.projects && Array.isArray(this.projects) && this.projects.length > 0)
    completedFields++;
  if (
    this.socialLinks &&
    Object.values(this.socialLinks).some((link) => link && link.trim())
  )
    completedFields++;
  if (this.profileImage && this.profileImage.trim()) completedFields++;

  this.completionPercentage = Math.round((completedFields / totalFields) * 100);
  return this.completionPercentage;
};

module.exports = mongoose.model("Profile", profileSchema);
