const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', postController.getAllPosts);
// router.get('/:id', postController.getPostById);
router.post('/', postController.createPost);
// router.put('/:id/edit', postController.updatePost);
// router.delete('/:id/delete', postController.deletePost);

module.exports = router;