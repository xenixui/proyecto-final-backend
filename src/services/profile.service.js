const { query } = require('../config/database');

async function getProfileByUserId(userId) {
    const users = await query(
        'SELECT id FROM users WHERE id = ? LIMIT 1',
        [userId],
    );

    if (!users[0]) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
    }

    const profiles = await query(
        `SELECT id, username, rating, photo_url, name, surname, phone, country, city, postal_code, biography, created_at, fk_usuarios_id
         FROM profiles
         WHERE fk_usuarios_id = ?
         LIMIT 1`,
        [userId],
    );

    if (!profiles[0]) {
        const error = new Error('Perfil no encontrado');
        error.status = 404;
        throw error;
    }

    return profiles[0];
}

module.exports = {
    getProfileByUserId,
};
