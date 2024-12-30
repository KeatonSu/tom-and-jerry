const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Get all forum posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort('-date');
        res.render('forum', { 
            user: req.session.user || null,
            posts: posts
        });
    } catch (error) {
        console.error('Forum error:', error);
        res.status(500).render('error', { error: 'Error loading forum' });
    }
});

// Create new post
router.post('/post', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    try {
        const newPost = new Post({
            title: req.body.title,
            content: req.body.content,
            author: req.session.user.username
        });

        await newPost.save();
        res.redirect('/forum');
    } catch (error) {
        res.status(500).render('error', { error: 'Error creating post' });
    }
});

// Add comment to post
router.post('/comment/:postId', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).render('error', { error: 'Post not found' });
        }

        post.comments.push({
            content: req.body.content,
            author: req.session.user.username
        });

        await post.save();
        res.redirect('/forum');
    } catch (error) {
        res.status(500).render('error', { error: 'Error adding comment' });
    }
});

module.exports = router; 