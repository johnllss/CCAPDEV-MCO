const router = require('express').Router();
const {
    createPost,
    getPosts,
    getPostById,
    editPost,
    deletePost
} = require('../controllers/postController');

router.post('/', createPost);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.get('/:id/view', require('../controllers/postController').renderPost);
router.put('/:id', editPost);
router.delete('/:id', deletePost);

module.exports = router;
