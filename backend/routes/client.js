const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticateToken, authorizePermission } = require('../middleware/authMiddleware');

router.route('/')
    .post(
        authenticateToken,                 
        authorizePermission(['clients:create']),
        clientController.createClient
    )
    .get(
        authenticateToken,
        authorizePermission(['clients:read']),  
        clientController.getClients 
    );

router.route('/:id')
    .get(
        authenticateToken,
        authorizePermission(['clients:read']),
        clientController.getClientById
    )
    .put(
        authenticateToken,
        authorizePermission(['clients:update']),
        clientController.updateClient
    )
    .delete(
        authenticateToken,
        authorizePermission(['clients:delete']),
        clientController.deleteClient
    );

module.exports = router;