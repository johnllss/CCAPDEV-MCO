const Comment = require('../models/Comment');

exports.getCommentsByPostId = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId }).sort({ createdAt: -1 });

        return res.json(comments);
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};