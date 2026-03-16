const mongoose = require('mongoose');
const Post = require('../models/Post');

async function createPost(req, res) {
    try {
        const { user, title, body, image } = req.body;

        if (!user || !title) {
            return res.status(400).json({ message: 'User and Title are required' });
        }

        if (!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const post = new Post({
            user,
            title,
            body,
            image
        });

        await post.save();

        const populated = await Post.findById(post._id).populate('user', 'username profile.photo');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}

async function getPosts(req, res) {
    try {
        const posts = await Post.find()
            .populate('user', 'username profile.photo')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}

async function getPostById(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        const post = await Post.findById(id).populate('user', 'username profile.photo');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}

async function editPost(req, res) {
    try {
        const { id } = req.params;
        const { title, body, image } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        const update = {};
        if (title !== undefined) update.title = title;
        if (body !== undefined) update.body = body;
        if (image !== undefined) update.image = image;

        const post = await Post.findByIdAndUpdate(id, update, {
            new: true,
            runValidators: true
        }).populate('user', 'username profile.photo');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}

async function deletePost(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        const post = await Post.findByIdAndDelete(id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    createPost,
    getPosts,
    getPostById,
    editPost,
    deletePost
};
