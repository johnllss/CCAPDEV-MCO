const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// GET all comments for a post
router.get('/:postId', commentController.getCommentsByPostId);

// POST new comment on a post
router.post('/:postId', commentController.createComment);

// PUT edit a comment
router.put('/:postId/:commentId', commentController.updateComment);

// DELETE a comment
router.delete('/:postId/:commentId', commentController.deleteComment);

module.exports = router;