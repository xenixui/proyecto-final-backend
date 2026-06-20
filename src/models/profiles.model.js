const db = require('../config/database');

async function getByUserId(userId) {
    const result = await db.query(
        `SELECT id, username, rating, photo_url, name, surname, phone, country, city, postal_code, biography, created_at, fk_usuarios_id
         FROM profiles
         WHERE fk_usuarios_id = ?
         LIMIT 1`,
        [userId],
    );

    return result[0] || null;
}

module.exports = {
    getByUserId,
};
