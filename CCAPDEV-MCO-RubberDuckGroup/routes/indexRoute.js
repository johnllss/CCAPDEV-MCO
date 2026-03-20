const express = require('express');
const postController = require('../controllers/postController');

const router = express.Router();

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

router.get('/logout', (req, res) => {
    res.render('logout');
});

router.get('/comments', (req, res) => {
    res.render('comments');
});

module.exports = router;
