const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Media = require('../models/Media');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const type = req.body.type || 'image';
        const uploadPath = path.join('public', 'uploads', type);
        cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function(req, file, cb) {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image or video file!'));
        }
    }
});

// Gallery page
router.get('/gallery', async (req, res) => {
    try {
        const images = await Media.find({ type: 'image' }).sort('-uploadDate');
        res.render('media/gallery', { images });
    } catch (error) {
        res.status(500).render('error', { error: 'Error loading gallery' });
    }
});

// Animations page
router.get('/animations', async (req, res) => {
    try {
        const animations = await Media.find({ type: 'animation' }).sort('-uploadDate');
        res.render('media/animations', { animations });
    } catch (error) {
        res.status(500).render('error', { error: 'Error loading animations' });
    }
});

// Upload form
router.get('/upload', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('media/upload');
});

// Handle upload
router.post('/upload', upload.single('mediaFile'), async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    try {
        const media = new Media({
            title: req.body.title,
            description: req.body.description,
            type: req.body.type,
            filename: req.file.filename,
            uploadedBy: req.session.user.id
        });

        await media.save();
        res.redirect(req.body.type === 'image' ? '/media/gallery' : '/media/animations');
    } catch (error) {
        res.status(500).render('error', { error: 'Error uploading file' });
    }
});

module.exports = router; 