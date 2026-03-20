const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Post = require('../models/Post');

function cleanRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // replace each seen special char w/ \ so Mongo reads it as literal text
}

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

function compactVotes(number) {
    const n = Number(number) || 0;

    if (n < 1000) 
        return String(n);

    const votes = new Intl.NumberFormat('en', {
        notation: 'compact',
        compactDisplay: 'short',
        roundingMode: 'floor',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    });

    return votes.format(n).replace(/\s+/g, '').toLowerCase();
}

function formatPost(post, req) {
    const currentUserId = req.session?.userId?.toString() || null;

    return {
        _id: post._id.toString(),
        title: post.title,
        content: post.body || post.image,
        body: post.body,
        image: post.image ? '/uploads/' + post.image : '',
        authorUsername: post.user?.username,
        authorPhoto: post.user?.profile?.photo || '/images/default-pfp.png',
        authorId: post.user?._id?.toString(),
        author: {
            username: post.user?.username,
            profile: {
                photo: post.user?.profile?.photo || '/images/default-pfp.png'
            }
        },
        createdAtLabel: relativeDate(post.createdAt),
        updatedAtLabel: post.updatedAt > post.createdAt ? relativeDate(post.updatedAt) : null,
        votes: compactVotes(post.votes),
        upvotes: post.upvotes.map(u => u.toString()),
        downvotes: post.downvotes.map(u => u.toString()),
        isUpvoted: currentUserId ? post.upvotes.some(u => u.toString() === currentUserId) : false,
        isDownvoted: currentUserId ? post.downvotes.some(u => u.toString() === currentUserId) : false
    };
}

async function uploadImage(req, res) {
    try {
        if (!req.files || !req.files.image)
            return res.status(400).json({ message: 'No file' });

        const image = req.files.image;
        if (!image.mimetype.startsWith('image/'))
            return res.status(400).json({ message: 'Invalid file type' });

        const ext = path.extname(image.name).toLowerCase();
        const filename = Date.now() + ext;
        const saveDir = path.join(__dirname, '..', 'public', 'uploads');
        if (!fs.existsSync(saveDir))
            fs.mkdirSync(saveDir, { recursive: true });

        const savePath = path.join(saveDir, filename);

        await image.mv(savePath);
        res.json({ filename });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Upload error' });
    }
}

async function votePost(req, res) {
    try {
        const { id } = req.params;
        const { type } = req.body;
        const userId = req.session?.userId || req.body.userId;

        if (!userId) 
            return res.status(401).json({ message: 'User not found' });

        if (!['up','down'].includes(type)) 
            return res.status(400).json({ message: 'Invalid vote type' });

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) 
            return res.status(400).json({ message: 'Invalid id' });

        const post = await Post.findById(id);

        if (!post) 
            return res.status(404).json({ message: 'Post not found' });

        const inUp = post.upvotes.some(u => u.toString() === userId);
        const inDown = post.downvotes.some(u => u.toString() === userId);

        if (type === 'up') {
            if (inUp) 
                post.upvotes = post.upvotes.filter(u => u.toString() !== userId);
            else {
                post.upvotes.push(userId);

                if (inDown) 
                    post.downvotes = post.downvotes.filter(u => u.toString() !== userId);
            }
        } else {
            if (inDown) 
                post.downvotes = post.downvotes.filter(u => u.toString() !== userId);
            else {
                post.downvotes.push(userId);

                if (inUp) 
                    post.upvotes = post.upvotes.filter(u => u.toString() !== userId);
            }
        }

        const up = post.upvotes.length;
        const down = post.downvotes.length;
        post.votes = up - down;

        await post.save({ timestamps: false });

        const score = post.upvotes.length - post.downvotes.length;

        res.json({ up, down, score: post.votes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

async function createPost(req, res) {
    try {
        const { user, title, body, image } = req.body;

        if (!user || !title)
            return res.status(400).json({ message: 'User and Title are required' });

        if (!mongoose.Types.ObjectId.isValid(user))
            return res.status(400).json({ message: 'Invalid user ID' });

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
        console.error(err);
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
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

async function renderIndex(req, res) {
    try {
        const posts = await Post.find()
            .populate('user', 'username profile.photo')
            .sort({ createdAt: -1 });

        const formattedPosts = posts.map(formatPost);

        res.render('index', { posts: formattedPosts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

async function getPostById(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: 'Invalid post ID' });

        const post = await Post.findById(id).populate('user', 'username profile.photo');

        if (!post)
            return res.status(404).json({ message: 'Post not found' });

        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

async function editPost(req, res) {
    try {
        const { id } = req.params;
        const { title, body, image } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: 'Invalid post ID' });

        const update = {};

        if (title !== undefined) 
            update.title = title;
        if (body !== undefined) 
            update.body = body;
        if (image !== undefined) 
            update.image = image;

        const post = await Post.findByIdAndUpdate(id, update, {
            new: true,
            runValidators: true
        }).populate('user', 'username profile.photo');

        if (!post)
            return res.status(404).json({ message: 'Post not found' });

        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

async function deletePost(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: 'Invalid post ID' });

        const post = await Post.findByIdAndDelete(id);

        if (!post)
            return res.status(404).json({ message: 'Post not found' });

        res.json({ message: 'Post deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

async function renderPost(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).send('Invalid post ID');

        const post = await Post.findById(id).populate('user', 'username profile.photo');

        if (!post) return res.status(404).send('Post not found');

        const rawBody = post.body || '';
        const body = rawBody.replace(/^\s+|\s+$/g, '').replace(/\n{3,}/g, '\n\n');

        const Comment = require('../models/Comment');
        const allComments = await Comment.find({ post: id })
            .populate('author', 'username profile photo')
            .sort({ createdAt: 1 });

        const buildReplies = (comments, parentId) => {
            return comments
                .filter(c => c.parentComment && c.parentComment.toString() === parentId.toString())
                .map(c => ({
                    _id: c._id.toString(),
                    content: c.content,
                    authorDisplay: c.author?.username || 'Anonymous',
                    authorPhoto: c.author?.profile?.photo || '/images/default-pfp.png',
                    createdAtLabel: relativeDate(c.createdAt),
                    isEdited: c.isEdited,
                    replies: buildReplies(comments, c._id)
                }));
        };

        const comments = allComments
            .filter(c => !c.parentComment)
            .map(c => ({
                _id: c._id.toString(),
                content: c.content,
                authorDisplay: c.author?.username || 'Anonymous',
                authorPhoto: c.author?.profile?.photo || '/images/default-pfp.png',
                createdAtLabel: relativeDate(c.createdAt),
                isEdited: c.isEdited,
                replies: buildReplies(allComments, c._id)
            }));

        const currentUserId = req.session?.userId?.toString() || null;

        res.render('view-post', {
            post: {
                _id: post._id.toString(),
                title: post.title,
                body: body,
                image: post.image ? '/uploads/' + post.image : "",
                authorUsername: post.user.username,
                authorPhoto: post.user.profile?.photo || '/images/default-pfp.png',
                authorId: post.user._id.toString(),
                timestamp: relativeDate(post.createdAt),
                editedAt: post.updatedAt > post.createdAt ? relativeDate(post.updatedAt) : null,
                votes: compactVotes(post.votes),
                upvotes: post.upvotes.map(u => u.toString()),
                downvotes: post.downvotes.map(u => u.toString()),
                isUpvoted: currentUserId ? post.upvotes.some(u => u.toString() === currentUserId) : false,
                isDownvoted: currentUserId ? post.downvotes.some(u => u.toString() === currentUserId) : false
            },
            comments,
            commentsCount: allComments.length,
            isOwner: req.session?.userId === post.user._id.toString()
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

// for the /search-results when user is searching
async function showSearchResults(req, res) {
    try {
        const searchQuery = (req.query.q || '').trim();
        let posts = [];

        if (searchQuery) {
            const cleanedQuery = cleanRegex(searchQuery);

            posts = await Post.find({
                $or: [ // if a match in title or body of the post (case insensitive)
                    { title: { $regex: cleanedQuery, $options: 'i' } },
                    { body: { $regex: cleanedQuery, $options: 'i' } }
                ]
            })
                .populate('user', 'username profile.photo')
                .sort({ createdAt: -1 });
        }

        const formattedPosts = posts.map(formatPost);

        res.render('search-results', {
            posts: formattedPosts,
            query: searchQuery,
            searchQuery
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

module.exports = {
    uploadImage,
    votePost,
    createPost,
    getPosts,
    renderIndex,
    getPostById,
    editPost,
    deletePost,
    renderPost,
    showSearchResults
};
