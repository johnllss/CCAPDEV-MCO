const mongoose = require('mongoose');
const path = require('path');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Activity = require('../models/Activity');
const relativeDate = require('../utils/relativeDate');
const { saveUploadedImage } = require('../utils/uploadImage');
const {
    BODY_MAX_LENGTH,
    buildBodyPreview,
    normalizePostBody
} = require('../utils/postBody');

function cleanRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // replace each seen special char w/ \ so Mongo reads it as literal text
}

const VALID_SORT_ORDERS = new Set(['newest', 'oldest', 'popular']);

function normalizeSortOrder(sortOrder) {
    return VALID_SORT_ORDERS.has(sortOrder) ? sortOrder : 'newest';
}

function buildSort(sortOrder) {
    if (sortOrder === 'popular') return { votes: -1, createdAt: -1 };
    if (sortOrder === 'oldest') return { createdAt: 1 };
    return { createdAt: -1 };
}

function parseDateInput(value, endOfDay = false) {
    if (!value || typeof value !== 'string') return null;

    const parsedDate = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime())) return null;

    if (endOfDay)
        parsedDate.setUTCHours(23, 59, 59, 999);

    return parsedDate;
}

async function buildPostFilters(req, options = {}) {
    const includeSearch = options.includeSearch === true;
    const searchQuery = includeSearch ? (req.query.q || '').trim() : '';
    const username = (req.query.username || '').trim();
    const dateFrom = (req.query.dateFrom || '').trim();
    const dateTo = (req.query.dateTo || '').trim();
    const sortOrder = normalizeSortOrder(req.query.sort);

    const mongoQuery = {};

    if (searchQuery) {
        const cleanedQuery = cleanRegex(searchQuery);
        mongoQuery.$or = [
            { title: { $regex: cleanedQuery, $options: 'i' } },
            { body: { $regex: cleanedQuery, $options: 'i' } }
        ];
    }

    if (username) {
        const cleanedUsername = cleanRegex(username);
        const matchingUsers = await User.find({
            username: { $regex: cleanedUsername, $options: 'i' }
        }).select('_id');

        if (!matchingUsers.length) {
            mongoQuery.user = { $in: [] };
        } else {
            mongoQuery.user = { $in: matchingUsers.map(user => user._id) };
        }
    }

    const fromDate = parseDateInput(dateFrom, false);
    const toDate = parseDateInput(dateTo, true);

    if (fromDate || toDate) {
        mongoQuery.createdAt = {};
        if (fromDate)
            mongoQuery.createdAt.$gte = fromDate;
        if (toDate)
            mongoQuery.createdAt.$lte = toDate;
    }

    const hasInvalidDateRange = fromDate && toDate && fromDate > toDate;

    return {
        mongoQuery,
        sortOrder,
        sort: buildSort(sortOrder),
        searchQuery,
        filters: {
            username,
            dateFrom,
            dateTo,
            sortOrder,
            isNewest: sortOrder === 'newest',
            isOldest: sortOrder === 'oldest',
            isPopular: sortOrder === 'popular',
            hasInvalidDateRange
        }
    };
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

async function formatPost(post, req) {
    const currentUserId = req.session?.userId?.toString() || null;
    const createdAtLabel = relativeDate(post.createdAt);
    const updatedAtLabel = post.updatedAt > post.createdAt ? relativeDate(post.updatedAt) : null;
    const commentCount = await Comment.countDocuments({ post: post._id });
    const { body, preview, isTruncated } = buildBodyPreview(post.body);

    return {
        _id: post._id.toString(),
        title: post.title,
        content: body || post.image,
        body,
        previewBody: preview,
        isBodyTruncated: isTruncated,
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
        isDownvoted: currentUserId ? post.downvotes.some(u => u.toString() === currentUserId) : false,
        commentCount: commentCount
    };
}

async function uploadImage(req, res) {
    try {
        if (!req.files || !req.files.image)
            return res.status(400).json({ message: 'No file' });

        const saveDir = path.join(__dirname, '..', 'public', 'uploads');
        const { filename } = await saveUploadedImage(req.files.image, saveDir);
        res.json({ filename });
    } catch (err) {
        console.error(err);
        if (err.message === 'Invalid file type' || err.message === 'Invalid file extension')
            return res.status(400).json({ message: err.message });

        res.status(500).json({ message: 'Upload error' });
    }
}

async function votePost(req, res) {
    try {
        const { id } = req.params;
        const { type } = req.body;
        const userId = req.session?.userId; // removed the req.body.userId so that it stays serverside

        if (!userId)
            return res.status(401).json({ message: 'User not found' });

        if (!['up', 'down'].includes(type))
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
        const { title, body, image } = req.body;
        const user = req.session?.userId;
        const normalizedBody = normalizePostBody(body);

        if (!user || !title)
            return res.status(400).json({ message: 'User and Title are required' });

        if (!mongoose.Types.ObjectId.isValid(user))
            return res.status(400).json({ message: 'Invalid user ID' });

        if (normalizedBody.length > BODY_MAX_LENGTH)
            return res.status(400).json({ message: `Post body must be ${BODY_MAX_LENGTH} characters or fewer.` });

        const post = new Post({
            user,
            title,
            body: normalizedBody,
            image: image ? path.basename(String(image).trim()) : ''
        });

        await post.save();
        await Promise.all([
            User.findByIdAndUpdate(user, { $inc: { posts: 1 } }),
            Activity.create({
                userId: user,
                type: 'post',
                text: title,
                link: `/posts/${post._id.toString()}/view`
            })
        ]);

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
        const { mongoQuery, sort, sortOrder, filters } = await buildPostFilters(req);

        const posts = await Post.find(mongoQuery)
            .populate('user', 'username profile.photo')
            .sort(sort);

        const formattedPosts = await Promise.all(posts.map(post => formatPost(post, req)));

        res.render('index', {
            posts: formattedPosts,
            sortOrder,
            filters,
            searchQuery: ''
        });
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
        const userId = req.session?.userId;
        const normalizedBody = body !== undefined ? normalizePostBody(body) : undefined;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: 'Invalid post ID' });

        const post = await Post.findById(id);

        if (!post)
            return res.status(404).json({ message: 'Post not found' });

        if (!userId || post.user.toString() !== userId.toString())
            return res.status(403).json({ message: 'Forbidden' });

        const update = {};

        if (title !== undefined)
            update.title = title;
        if (body !== undefined) {
            if (normalizedBody.length > BODY_MAX_LENGTH)
                return res.status(400).json({ message: `Post body must be ${BODY_MAX_LENGTH} characters or fewer.` });

            update.body = normalizedBody;
        }
        if (image !== undefined)
            update.image = image ? path.basename(String(image).trim()) : '';

        const updatedPost = await Post.findByIdAndUpdate(id, update, {
            new: true,
            runValidators: true
        }).populate('user', 'username profile.photo');

        res.json(updatedPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

async function deletePost(req, res) {
    try {
        const { id } = req.params;
        const userId = req.session?.userId;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: 'Invalid post ID' });

        const post = await Post.findById(id);

        if (!post)
            return res.status(404).json({ message: 'Post not found' });

        if (!userId || post.user.toString() !== userId.toString())
            return res.status(403).json({ message: 'Forbidden' });

        await Post.findByIdAndDelete(id);

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

        const body = normalizePostBody(post.body);

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
                previewBody: body,
                isBodyTruncated: false,
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
        const { mongoQuery, sort, searchQuery, filters } = await buildPostFilters(req, { includeSearch: true });
        let posts = [];

        if (searchQuery) {
            posts = await Post.find(mongoQuery)
                .populate('user', 'username profile.photo')
                .sort(sort);
        }

        const formattedPosts = await Promise.all(posts.map(post => formatPost(post, req)));

        res.render('search-results', {
            posts: formattedPosts,
            query: searchQuery,
            searchQuery,
            filters,
            resetSearchHref: searchQuery ? `/search-results?q=${encodeURIComponent(searchQuery)}` : '/search-results'
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