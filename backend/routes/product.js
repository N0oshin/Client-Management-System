const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizePermission } = require('../middleware/authMiddleware');


router.route('/')
    .post(
        authenticateToken,
        authorizePermission(['products:create']),
        productController.createProduct
    )
    .get(
        authenticateToken,
        authorizePermission(['products:read']),
        productController.getProducts
    );


router.route('/:id')
    .get(
        authenticateToken,
        authorizePermission(['products:read']),
        productController.getProductById
    )
    .put(
        authenticateToken,
        authorizePermission(['products:update']),
        productController.updateProduct
    )
    .delete(
        authenticateToken,
        authorizePermission(['products:delete']),
        productController.deleteProduct
    );

module.exports = router;