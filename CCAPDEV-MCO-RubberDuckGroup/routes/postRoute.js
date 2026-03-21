const router = require('express').Router();
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

router.post('/upload-image', uploadImage);
router.post('/:id/vote', votePost);
router.post('/', createPost);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.get('/:id/view', renderPost);
router.put('/:id', editPost);
router.delete('/:id', deletePost);

module.exports = router;
 