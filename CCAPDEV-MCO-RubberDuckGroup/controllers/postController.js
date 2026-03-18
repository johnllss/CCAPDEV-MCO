const Post = require('../models/Post');

exports.getAllPosts = async (req, res) => {
    const posts = await Post.find().populate('author');
    res.render('index', { posts });
};

exports.createPost = async (req, res) => {
    const { title, content } = req.body;
    await Post.create({ title, content, author: req.session.userId });
    res.redirect('/posts');
};