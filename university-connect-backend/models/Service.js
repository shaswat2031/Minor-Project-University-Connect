const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    skills: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    instagram: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/(www\.)?instagram\.com\/.*/.test(v);
        },
        message: "Please provide a valid Instagram URL",
      },
    },
    whatsapp: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^\+?[1-9]\d{1,14}$/.test(v);
        },
        message: "Please provide a valid WhatsApp number",
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
serviceSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("Service", serviceSchema);
