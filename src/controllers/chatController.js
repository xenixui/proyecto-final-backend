const messageService = require('../services/messageService');
const chatService = require('../services/chatService')

async function getChatMessages(req, res, next) {
  try {
    const chatId = req.params.id;

    const result = await messageService.getChatMessagesAndMarkRead(chatId, req.user.id);

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

async function sendMessage(req, res, next) {
  try {
    const chatId = req.params.id;
    const { message } = req.body;

    const result = await messageService.createChatMessage(chatId, req.user.id, message);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function getUserChats(req, res) {
  try {
    const { id: userId } = req.user
    const chats = await chatService.getAllChats(userId);
    res.json(chats)

  } catch (_error) {
    res.status(500).json({
      message: 'Error al consultar la BBDD'
    })
  }
}

async function createChat(req, res) {
  try {
    const { id: fk_buyer_id } = req.user
    const { fk_articles_id } = req.body

    const nuevoChat = await chatService.createChat(fk_buyer_id, fk_articles_id)
    if (!nuevoChat) {
      return res.status(404).json({
        message: 'Error al procesar la solicitud del chat'
      })
    }
    res.json(nuevoChat)

  } catch (_error) {
    res.status(500).json({
      message: 'Error al crear o recuperar el chat'
    })
  }
}

module.exports = {
  getChatMessages,
  sendMessage,
  getUserChats,
  createChat
};
