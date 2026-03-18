const mongoose = require('mongoose');
const Post = require('../models/Post');

function relativeDate(date) {
    if (!date) 
        return '';

    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

    if (seconds < 1) 
        return 'just now';

    const units = [
        { label: 'y', s: 31536000 },
        { label: 'mo', s: 2592000 },
        { label: 'w', s: 604800 },
        { label: 'd', s: 86400 },
        { label: 'h', s: 3600 },
        { label: 'm', s: 60 },
        { label: 's', s: 1 }
    ];

    for (const u of units) {
        const val = Math.floor(seconds / u.s);
        if (val >= 1) return `${val}${u.label} ago`;
    }

    return 'just now';
}



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

async function renderPost(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send('Invalid post ID');
        }

        const post = await Post.findById(id).populate('user', 'username profile.photo');

        if (!post) return res.status(404).send('Post not found');

        res.render('post', {
            post: {
                title: post.title,
                body: post.body,
                image: post.image,
                authorUsername: post.user.username,
                authorPhoto: post.user.profile?.photo || '/assets/images/default-pfp.png',
                authorId: post.user._id.toString(),
                timestamp: relativeDate(post.createdAt),
                editedAt: post.updatedAt > post.createdAt ? relativeDate(post.updatedAt) : null,
                votes: post.votes
            },
            isOwner: req.session?.userId === post.user._id.toString()
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

module.exports = {
    createPost,
    getPosts,
    getPostById,
    editPost,
    deletePost,
    renderPost
};
