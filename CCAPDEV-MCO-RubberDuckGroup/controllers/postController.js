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

function toUploadImagePath(image) {
    if (!image || typeof image !== 'string')
        return '';

    const cleanedImage = path.basename(image.trim());
    if (!cleanedImage || ['undefined', 'null', 'false', 'nan'].includes(cleanedImage.toLowerCase()))
        return '';

    return `/uploads/${cleanedImage}`;
}

function formatPost(post, req) {
    const currentUserId = req.session?.userId?.toString() || null;
    const createdAtLabel = relativeDate(post.createdAt);
    const updatedAtLabel = post.updatedAt > post.createdAt ? relativeDate(post.updatedAt) : null;

    return {
        _id: post._id.toString(),
        title: post.title,
        content: post.body || post.image,
        body: post.body,
        image: toUploadImagePath(post.image),
        authorUsername: post.user?.username,
        authorPhoto: post.user?.profile?.photo || '/images/default-pfp.png',
        authorId: post.user?._id?.toString(),
        author: {
            username: post.user?.username,
            profile: {
                photo: post.user?.profile?.photo || '/images/default-pfp.png'
            }
        },
        createdAtLabel,
        updatedAtLabel,
        timestamp: createdAtLabel,
        editedAt: updatedAtLabel,
        postHref: `/posts/${post._id.toString()}/view`,
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

        const existsPost = await Post.findById(id).select('_id').lean();
        if (!existsPost) return res.status(404).json({ message: 'Post not found' });

        const inUp = await Post.exists({ _id: id, upvotes: userId });
        const inDown = await Post.exists({ _id: id, downvotes: userId });

        let updated;
        if (type === 'up') {
            if (inUp) {
                updated = await Post.findOneAndUpdate({ _id: id }, { $pull: { upvotes: userId } }, { returnDocument: 'after', timestamps: false });
            } else {
                const update = { $addToSet: { upvotes: userId } };
                if (inDown) update.$pull = { downvotes: userId };
                updated = await Post.findOneAndUpdate({ _id: id }, update, { returnDocument: 'after', timestamps: false });
            }
        } else {
            if (inDown) {
                updated = await Post.findOneAndUpdate({ _id: id }, { $pull: { downvotes: userId } }, { returnDocument: 'after', timestamps: false });
            } else {
                const update = { $addToSet: { downvotes: userId } };
                if (inUp) update.$pull = { upvotes: userId };
                updated = await Post.findOneAndUpdate({ _id: id }, update, { returnDocument: 'after', timestamps: false });
            }
        }

        if (!updated) {
            console.error('votePost: update returned null', { id, userId, type, inUp, inDown });
            return res.status(500).json({ message: 'Failed to update votes' });
        }

        const up = (updated.upvotes || []).length;
        const down = (updated.downvotes || []).length;
        const votes = up - down;

        try {
            await Post.findByIdAndUpdate(id, { $set: { votes } }, { timestamps: false });
        } catch (e) {
            console.error('votePost: failed to persist votes', { id, votes, err: e });
        }

        res.json({ up, down, score: votes });
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
            image: image ? path.basename(String(image).trim()) : ''
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

        const formattedPosts = posts.map(post => formatPost(post, req));

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
            update.image = image ? path.basename(String(image).trim()) : '';

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

        const currentUserId = req.session?.userId?.toString() || null;

        const buildReplies = (comments, parentId) => {
            return comments
                .filter(c => c.parentComment && c.parentComment.toString() === parentId.toString())
                .map(c => ({
                    _id: c._id.toString(),
                    content: c.content,
                    authorId: c.author?._id?.toString(),
                    authorDisplay: c.author?.username || 'Anonymous',
                    authorPhoto: c.author?.profile?.photo || '/images/default-pfp.png',
                    createdAtLabel: relativeDate(c.createdAt),
                    isEdited: c.isEdited,
                    isOwner: currentUserId ? (c.author?._id?.toString() === currentUserId) : false,
                    replies: buildReplies(comments, c._id)
                }));
        };

        const comments = allComments
            .filter(c => !c.parentComment)
            .map(c => ({
                _id: c._id.toString(),
                content: c.content,
                authorId: c.author?._id?.toString(),
                authorDisplay: c.author?.username || 'Anonymous',
                authorPhoto: c.author?.profile?.photo || '/images/default-pfp.png',
                createdAtLabel: relativeDate(c.createdAt),
                isEdited: c.isEdited,
                isOwner: currentUserId ? (c.author?._id?.toString() === currentUserId) : false,
                replies: buildReplies(allComments, c._id)
            }));

        res.render('view-post', {
            post: {
                _id: post._id.toString(),
                title: post.title,
                body: body,
                image: toUploadImagePath(post.image),
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
            currentUserId,
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

        const formattedPosts = posts.map(post => formatPost(post, req));

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
