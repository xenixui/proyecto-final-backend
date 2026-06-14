const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateSchema } = require('../middlewares/validation.middleware');
const { chatParamsSchema } = require('../schemas/chat.schema');

const router = express.Router();

router.get('/:id/mensajes', authMiddleware, validateSchema(chatParamsSchema, 'params'), chatController.getChatMessages);

module.exports = router;
