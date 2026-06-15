const ChatModel = require ('../models/chat.model');

const getAllChats = async (userId) => {
    const chats = await ChatModel.findAllByUser(userId)
    return chats;
}

const createChat = async (fk_buyer_id, fk_articles_id) => {
    const chatExist = await ChatModel.findChat(fk_buyer_id, fk_articles_id);

    if (chatExist) {
        return chatExist
    }

    return await ChatModel.insertChat({fk_buyer_id, fk_articles_id})

}

module.exports = {
    getAllChats,
    createChat
}
