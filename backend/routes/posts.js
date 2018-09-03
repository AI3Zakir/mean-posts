const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const fileInput = require('../middleware/file');
const PostController = require('../controllers/posts');

router.get('', PostController.getPosts);
router.get('/:id', PostController.getPost);
router.post('', checkAuth, fileInput, PostController.createPost);
router.put('/:id', checkAuth, fileInput, PostController.updatePost);
router.delete('/:id', checkAuth, PostController.deletePost);

module.exports = router;
