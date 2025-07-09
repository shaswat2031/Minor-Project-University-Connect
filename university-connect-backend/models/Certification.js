const mongoose = require("mongoose");

const certificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "React",
        "Java",
        "Python",
        "JavaScript",
        "Data Structures",
        "Algorithms",
        "Web Development",
      ],
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    mcqScore: {
      type: Number,
      default: 0,
    },
    mcqTotal: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
    },
    certificateId: {
      type: String,
      unique: true,
      required: true,
    },
    certificateUrl: String,
    badgeType: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate badge type based on percentage
certificationSchema.methods.calculateBadgeType = function () {
  if (this.percentage >= 95) {
    this.badgeType = "platinum";
  } else if (this.percentage >= 85) {
    this.badgeType = "gold";
  } else if (this.percentage >= 75) {
    this.badgeType = "silver";
  } else {
    this.badgeType = "bronze";
  }
  return this.badgeType;
};

// Generate certificate ID before saving
certificationSchema.pre("save", function (next) {
  if (!this.certificateId) {
    this.certificateId = `UC-${Math.floor(
      100000 + Math.random() * 900000
    )}-${new Date().getFullYear()}`;
  }
  this.calculateBadgeType();
  next();
});

module.exports = mongoose.model("Certification", certificationSchema);
