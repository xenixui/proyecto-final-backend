const db = require('../config/database');

async function getArticleForReview(articleId) {
    const rows = await db.query(
        `SELECT
            a.id,
            a.title,
            a.status,
            a.fk_buyer_id,
            a.fk_users_id AS seller_id
         FROM articles a
         WHERE a.id = ?
         LIMIT 1`,
        [articleId],
    );

    return rows[0] || null;
}

async function getReviewByBuyerAndArticle(buyerId, articleId) {
    const rows = await db.query(
        `SELECT id
         FROM reviews
         WHERE fk_buyer_id = ? AND fk_article_id = ?
         LIMIT 1`,
        [buyerId, articleId],
    );

    return rows[0] || null;
}

async function createReview({ stars, comentario, buyerId, sellerId, articleId }) {
    const result = await db.query(
        `INSERT INTO reviews (stars, comentario, created_at, fk_buyer_id, fk_seller_id, fk_article_id)
         VALUES (?, ?, NOW(), ?, ?, ?)`,
        [stars, comentario, buyerId, sellerId, articleId],
    );

    const rows = await db.query(
        `SELECT
            r.id,
            r.stars,
            r.comentario,
            r.created_at,
            r.fk_buyer_id,
            r.fk_seller_id,
            r.fk_article_id,
            a.title AS article_title
         FROM reviews r
         LEFT JOIN articles a ON a.id = r.fk_article_id
         WHERE r.id = ?
         LIMIT 1`,
        [result.insertId],
    );

    return rows[0];
}

module.exports = {
    getArticleForReview,
    getReviewByBuyerAndArticle,
    createReview,
};