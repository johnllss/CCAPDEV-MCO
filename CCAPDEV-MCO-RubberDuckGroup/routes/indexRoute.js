const express = require('express');
const postController = require('../controllers/postController');
const packageJson = require('../package.json');

const router = express.Router();

const packageDescriptions = {
    bcrypt: 'Hashes user passwords before they are stored in the database.',
    'cookie-parser': 'Parses cookies so the app can read session-related data from incoming requests.',
    cors: 'Handles cross-origin requests for browser compatibility during development and deployment.',
    dotenv: 'Loads environment variables such as database connection strings and session secrets.',
    express: 'Provides the web server, routing, and middleware pipeline for the application.',
    'express-fileupload': 'Handles profile photo and post image uploads.',
    'express-handlebars': 'Supports server-side templating for dynamic page rendering.',
    'express-session': 'Maintains authenticated user sessions while the browser window remains open.',
    hbs: 'Registers and renders Handlebars partials used across shared interface sections.',
    mongoose: 'Connects the app to MongoDB and defines the application data models.',
    nodemon: 'Restarts the development server automatically when source files change.'
};

const thirdPartyLibraries = [
    {
        name: 'Google Fonts - DM Sans',
        purpose: 'Provides the primary sans-serif typeface used across the interface.',
        link: 'https://fonts.google.com/specimen/DM+Sans'
    },
    {
        name: 'Flaticon social media icons',
        purpose: 'Supplies the Facebook, Instagram, and YouTube footer icons used in the layout.',
        link: 'https://www.flaticon.com/'
    },
    {
        name: 'Material Symbols by Google',
        purpose: 'Supplies the icons used in navigation and action buttons.',
        link: 'https://icon-sets.iconify.design/material-symbols/'
    }
];

router.get('/', postController.renderIndex);

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/profile', (req, res) => {
    res.render('profile');
});

router.get('/edit-profile', (req, res) => {
    res.render('edit-profile');
});

router.get('/create-post', (req, res) => {
    res.render('create-post');
});

router.get('/edit-post', (req, res) => {
    res.render('edit-post');
});

router.get('/view-post', (req, res) => {
    res.render('view-post', {
        post: {
            title: 'View a Post',
            content: 'Use /posts/:id to load a specific post from the database.',
            author: {
                username: 'RubberDuckAdmin',
                profile: {
                    photo: '/images/default-pfp.png'
                }
            },
            createdAtLabel: 'just now'
        },
        comments: [],
        commentsCount: 0
    });
});

router.get('/search-results', postController.showSearchResults);

router.get('/about', (req, res) => {
    const npmPackages = Object.entries(packageJson.dependencies || {}).map(([name, version]) => ({
        name,
        version,
        description: packageDescriptions[name] || 'Used to support application features and development workflow.'
    }));

    res.render('about', {npmPackages, thirdPartyLibraries});
});

router.get('/logout', (req, res) => {
    res.render('logout');
});

module.exports = router;