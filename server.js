const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const mediaRoutes = require('./routes/media');
const forumRoutes = require('./routes/forum');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/tom-and-jerry', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session middleware
app.use(session({
    secret: 'tom-and-jerry-secret',
    resave: false,
    saveUninitialized: true
}));

// Make user available to all templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/media', mediaRoutes);
app.use('/forum', forumRoutes);

app.get('/', (req, res) => {
    res.render('index', { user: req.session.user || null });
});

app.get('/story', (req, res) => {
    res.render('story', { user: req.session.user || null });
});

app.get('/characters', (req, res) => {
    res.render('characters', { user: req.session.user || null });
});

app.use('/forum', forumRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 