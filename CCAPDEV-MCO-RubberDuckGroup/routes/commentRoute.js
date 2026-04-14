const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { requireAuthApi } = require('../utils/authGuards');

// GET all comments for a post
router.get('/:postId', commentController.getCommentsByPostId);

// POST new comment on a post
router.post('/:postId', requireAuthApi, commentController.createComment);

// PUT edit a comment
router.put('/:postId/:commentId', requireAuthApi, commentController.updateComment);

// DELETE a comment
router.delete('/:postId/:commentId', requireAuthApi, commentController.deleteComment);

module.exports = router;