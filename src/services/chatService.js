const chatModel = require('../models/chat.model');

async function getAllChats (fk_buyer_id) {
    const chats = await chatModel.findAllByUser(fk_buyer_id)
    return chats;
}

async function createChat (fk_buyer_id, fk_articles_id) {
    const chatExist = await chatModel.findChatByBuyerAndArticle(fk_buyer_id, fk_articles_id);
    console.log( chatExist);
    if (chatExist) {
        return {
            id: chatExist.id,
            message: 'Chat existente'
        }
    }

    const nuevoChat = await chatModel.insertChat({
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