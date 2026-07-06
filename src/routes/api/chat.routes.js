const express = require('express');
const chatController = require('../../controllers/chatController');
const authMiddleware = require('../../middlewares/auth.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const {
    chatParamsSchema,
    createChatSchema,
    sendMessageSchema,
} = require('../../schemas/chat.schema');

const router = express.Router();

router.get(
    '/:id/mensajes',
    authMiddleware,
    validateSchema(chatParamsSchema, 'params'),
    chatController.getChatMessages,
);

router.post(
    '/:id/mensajes',
    authMiddleware,
    validateSchema(chatParamsSchema, 'params'),
    validateSchema(sendMessageSchema, 'body'),
    chatController.sendMessage,
);

router.get('/', authMiddleware, chatController.getUserChats);

router.post(
    '/',
    authMiddleware,
    validateSchema(createChatSchema, 'body'),
    chatController.createChat,
);

module.exports = router;
