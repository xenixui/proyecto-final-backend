const messageService = require('../services/messageService');

async function getChatMessages(req, res, next) {
  try {
    const chatId = Number(req.params.id);

    if (!Number.isInteger(chatId) || chatId <= 0) {
      return res.status(400).json({ message: 'Id de chat inválido' });
    }

    const result = await messageService.getChatMessagesAndMarkRead(chatId, req.user.id);

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getChatMessages,
};
