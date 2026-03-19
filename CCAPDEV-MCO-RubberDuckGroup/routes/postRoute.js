const router = require('express').Router();
const {
    createPost,
    getPosts,
    getPostById,
    editPost,
    deletePost,
    renderPost
} = require('../controllers/postController');

router.post('/', createPost);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.get('/:id/view', renderPost);
router.put('/:id', editPost);
router.delete('/:id', deletePost);

module.exports = router;
