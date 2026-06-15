const ChatService = require('../services/chatService')

const getAll = async (req, res) => {
    try {
        const { id: userId } = req.user
        const chats = await ChatService.getAllChats(userId);
        res.json(chats)

    } catch (error) {
        res.status(500).json({
            message: 'Error al consultar la BBDD'
        })
    }
}

const createChat = async (req, res) => {
    try {
        const { id: fk_buyer_id } = req.user
        const { fk_articles_id } = req.body

        const nuevoChat = await ChatService.createChat(fk_buyer_id, fk_articles_id)
        if (!nuevoChat) {
            return res.status(404).json({
                message: 'Error al procesar la solicitud del chat'
            })
        }
        res.json(nuevoChat)

    } catch (error) {
        res.status(500).json({
            message: 'Error al crear o recuperar el chat'
        })
    }
}


module.exports = {
    getAll,
    createChat
}