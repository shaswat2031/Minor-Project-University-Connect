const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Debug middleware for all auth routes
router.use((req, res, next) => {
    console.log(`[Auth Route Debug] ${req.method} ${req.url}`);
    console.log('[Auth Route Debug] Headers:', req.headers);
    console.log('[Auth Route Debug] Body:', req.body);
    next();
});

// Login route
router.post('/login', async (req, res) => {
    console.log('[Login Route] Attempt received');
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            console.log('[Login Route] Missing email or password');
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        console.log('[Login Route] User found:', !!user);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('[Login Route] Password match:', isMatch);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-fallback-secret',
            { expiresIn: '24h' }
        );

        // Send response
        console.log('[Login Route] Login successful for user:', user._id);
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('[Login Route] Error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login'
        });
    }
});

// Register route
router.post('/register', async (req, res) => {
    console.log('[Register Route] Attempt received');
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            console.log('[Register Route] Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('[Register Route] User already exists');
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();
        console.log('[Register Route] User created:', user._id);

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-fallback-secret',
            { expiresIn: '24h' }
        );

        // Send response
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('[Register Route] Error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during registration'
        });
    }
});

module.exports = router;
