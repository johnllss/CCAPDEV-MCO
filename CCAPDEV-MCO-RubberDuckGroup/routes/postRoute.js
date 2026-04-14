const router = require('express').Router();
const { requireAuthApi } = require('../utils/authGuards');
const {
    uploadImage,
    votePost,
    createPost,
    getPosts,
    getPostById,
    editPost,
    deletePost,
    renderPost
} = require('../controllers/postController');

router.post('/upload-image', requireAuthApi, uploadImage);
router.post('/:id/vote', votePost);
router.post('/', requireAuthApi, createPost);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.get('/:id/view', renderPost);
router.put('/:id', requireAuthApi, editPost);
router.delete('/:id', requireAuthApi, deletePost);

module.exports = router;