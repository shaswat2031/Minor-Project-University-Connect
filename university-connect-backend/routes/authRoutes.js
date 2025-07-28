const express = require("express");
const bcryptUtil = require("../utils/bcryptUtil");
const jwt = require("jsonwebtoken"); // Add this import
const User = require("../models/User");

const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  try {
    console.log("Registration request received:", {
      name: req.body.name,
      email: req.body.email,
      hasPassword: !!req.body.password,
    });

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Invalid email format:", email);
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    // Password validation
    if (password.length < 6) {
      console.log("Password too short");
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    console.log("Checking if user already exists...");
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists with email:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("Hashing password...");
    const hashedPassword = await bcryptUtil.hash(password, 12);

    console.log("Creating new user...");
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    console.log("User created successfully:", newUser._id);

    // Return the newly created user's details (excluding password)
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Updated Login route with JWT
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcryptUtil.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create and sign JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Log the response for debugging
    const response = {
      userId: user._id,
      token: token,
      name: user.name,
      email: user.email,
    };
    console.log("Login Response:", response);

    // Send the response
    res.json(response);
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
