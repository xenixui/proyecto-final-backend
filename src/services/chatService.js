const ChatModel = require('../models/chat.model');

const getAllChats = async (fk_buyer_id) => {
    const chats = await ChatModel.findAllByUser(fk_buyer_id)
    return chats;
}

const createChat = async (fk_buyer_id, fk_articles_id) => {
    const chatExist = await ChatModel.findChat(fk_buyer_id, fk_articles_id);
    console.log( chatExist);
    if (chatExist) {
        return {
            id: chatExist.id,
            message: 'Chat existente'
        }
    }

    const nuevoChat = await ChatModel.insertChat({
        fk_buyer_id,
        fk_articles_id
    })
    return {
        id: nuevoChat.insertId,
        message: 'Nuevo chat creado'
    }

}

module.exports = {
    getAllChats,
    createChat
}