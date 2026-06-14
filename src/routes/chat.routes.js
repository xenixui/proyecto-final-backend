const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/:id/mensajes', authMiddleware, chatController.getChatMessages);

module.exports = router;
