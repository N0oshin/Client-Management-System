const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken, authorizePermission } = require('../middleware/authMiddleware');


router.route('/')
    .post(
        authenticateToken,
        authorizePermission(['comments:create']),
        commentController.createComment
    )
    .get(
        authenticateToken,
        authorizePermission(['comments:read']),
        commentController.getComments
    );


router.route('/:id')
    .get(
        authenticateToken,
        authorizePermission(['comments:read']),
        commentController.getCommentById
    )
    .put(
        authenticateToken,
        authorizePermission(['comments:update']),
        commentController.updateComment
    )
    .delete(
        authenticateToken,
        authorizePermission(['comments:delete']),
        commentController.deleteComment
    );

module.exports = router;