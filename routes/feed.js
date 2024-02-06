const express = require('express');
const { body } = require('express-validator');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth')

const router = express.Router();

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);


// POST /feed/posts --> need validation
router.post('/posts', [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
], isAuth, feedController.createPost);

// GET single post
router.get('/posts/:postId',isAuth, feedController.getPost);

// Update Post
router.put('/posts/:postId', [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
], isAuth,feedController.updatePost);

// Delete Post
router.delete('/posts/:postId', isAuth, feedController.deletePost)

module.exports = router     // this because i export one function