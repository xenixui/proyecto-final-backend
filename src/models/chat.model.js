const db = require('../config/database');

const findChat = async (fk_buyer_id, fk_articles_id) => {
    const result = await db.query(
        `SELECT * FROM chats 
        WHERE fk_buyer_id = ? AND fk_articles_id = ?`,
        [fk_buyer_id, fk_articles_id]
    );
    if (result.length === 0) return null
    return result[0]
}

const findAllByUser = async (fk_buyer_id) => {
    const result = await db.query(
        `SELECT chats.id,
            chats.created_at,
            articles.title AS article_title,
            articles.price AS article_price,
            profiles.username AS buyer_name
        FROM chats 
        INNER JOIN articles ON chats.fk_articles_id = articles.id
        INNER JOIN profiles ON chats.fk_buyer_id = profiles.fk_usuarios_id
        WHERE chats.fk_buyer_id = ?`,
        [fk_buyer_id]
    );
    if (result.length === 0) return null
    return result;
}

const insertChat = async ({ fk_buyer_id, fk_articles_id }) => {
    const result = await db.query(
        `INSERT INTO chats (created_at, update_at, fk_buyer_id, fk_articles_id) VALUES
        (NOW(), NOW(), ?, ?)`,
        [fk_buyer_id, fk_articles_id]
    );
    return result;
}


module.exports = {
    findChat,
    findAllByUser,
    insertChat

}