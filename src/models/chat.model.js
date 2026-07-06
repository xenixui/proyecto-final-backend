const db = require('../config/database');

async function findChatByBuyerAndArticle (fk_buyer_id, fk_articles_id) {
    const result = await db.query(
        `SELECT * FROM chats 
        WHERE fk_buyer_id = ? AND fk_articles_id = ?`,
        [fk_buyer_id, fk_articles_id]
    );
    if (result.length === 0) return null
    return result[0]
}

async function findAllByUser (userId) {
    const result = await db.query(
        `SELECT
            chats.id,
            chats.created_at,
            articles.title AS article_title,
            articles.price AS article_price,
            IF(chats.fk_buyer_id = ?, seller_profile.username, buyer_profile.username) AS contact_name,
            buyer_profile.username AS buyer_name
        FROM chats 
        INNER JOIN articles ON chats.fk_articles_id = articles.id
        INNER JOIN profiles buyer_profile ON chats.fk_buyer_id = buyer_profile.fk_usuarios_id
        INNER JOIN profiles seller_profile ON articles.fk_users_id = seller_profile.fk_usuarios_id
        WHERE chats.fk_buyer_id = ? OR articles.fk_users_id = ?
        ORDER BY chats.update_at DESC, chats.created_at DESC`,
        [userId, userId, userId]
    );

    return result;
}

async function insertChat ({ fk_buyer_id, fk_articles_id }) {
    const result = await db.query(
        `INSERT INTO chats (created_at, update_at, fk_buyer_id, fk_articles_id) VALUES
        (NOW(), NOW(), ?, ?)`,
        [fk_buyer_id, fk_articles_id]
    );
    return result;
}


module.exports = {
    findChatByBuyerAndArticle,
    findAllByUser,
    insertChat

}
