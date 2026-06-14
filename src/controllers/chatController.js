const messageService = require('../services/messageService');

async function getChatMessages(req, res, next) {
  try {
    const chatId = req.params.id;

    const result = await messageService.getChatMessagesAndMarkRead(chatId, req.user.id);

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getChatMessages,
};
