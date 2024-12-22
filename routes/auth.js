const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
};

// Login page
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// Register page
router.get('/register', (req, res) => {
    res.render('auth/register');
});

// Register handle
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Validation
        if (password !== confirmPassword) {
            return res.render('auth/register', { 
                error: 'Passwords do not match',
                username,
                email 
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.render('auth/register', {
                error: 'Username or email already exists',
                username,
                email
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();
        res.redirect('/auth/login');
    } catch (error) {
        res.render('auth/register', {
            error: 'An error occurred during registration',
            username: req.body.username,
            email: req.body.email
        });
    }
});

// Login handle
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('auth/login', {
                error: 'Invalid username or password',
                username
            });
        }

        // Validate password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('auth/login', {
                error: 'Invalid username or password',
                username
            });
        }

        // Create session
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email
        };

        res.redirect('/');
    } catch (error) {
        res.render('auth/login', {
            error: 'An error occurred during login',
            username: req.body.username
        });
    }
});

// Logout handle
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router; 