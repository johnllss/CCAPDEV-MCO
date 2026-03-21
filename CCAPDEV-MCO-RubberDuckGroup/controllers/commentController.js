const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const User = require('../models/User');

// GET all comments for a post (nested structure)
exports.getCommentsByPostId = async (req, res) => {
    try {
        const allComments = await Comment.find({ post: req.params.postId })
            .populate('author', 'username profilePicture')
            .sort({ createdAt: 1 });

        // Build nested structure
        const topLevel = allComments.filter(c => !c.parentComment);
        const buildReplies = (comments, parentId) => {
            return comments
                .filter(c => c.parentComment && c.parentComment.toString() === parentId.toString())
                .map(c => ({
                    ...c.toObject(),
                    replies: buildReplies(comments, c._id)
                }));
        };

        const nested = topLevel.map(c => ({
            ...c.toObject(),
            replies: buildReplies(allComments, c._id)
        }));

        return res.json(nested);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// POST a new comment
exports.createComment = async (req, res) => {
    try {
        const { content, authorId, parentCommentId } = req.body;
        const { postId } = req.params;
        const activityType = parentCommentId ? 'reply' : 'comment';

        const newComment = new Comment({
            content,
            author: authorId,
            post: postId,
            parentComment: parentCommentId || null
        });

        await newComment.save();
        await Promise.all([
            User.findByIdAndUpdate(authorId, { $inc: { replies: 1 } }),
            Activity.create({
                userId: authorId,
                type: activityType,
                text: content,
                link: `/posts/${postId}/view#comment-${newComment._id.toString()}`
            })
        ]);
        await newComment.populate('author', 'username profilePicture');

        return res.status(201).json(newComment);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// PUT edit a comment
exports.updateComment = async (req, res) => {
    try {
        const { content } = req.body;

        const updated = await Comment.findByIdAndUpdate(
            req.params.commentId,
            { content, isEdited: true },
            { new: true }
        ).populate('author', 'username profilePicture');

        if (!updated) return res.status(404).json({ message: 'Comment not found' });

        return res.json(updated);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};
// DELETE a comment
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.commentId);

        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        // Also delete all replies to this comment
        await Comment.deleteMany({ parentComment: req.params.commentId });

        return res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};