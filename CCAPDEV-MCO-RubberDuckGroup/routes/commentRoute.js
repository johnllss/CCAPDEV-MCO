const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.get('/posts', commentController.method);

module.exports = router;