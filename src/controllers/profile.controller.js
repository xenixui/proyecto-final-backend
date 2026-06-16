const { query } = require('../config/database');

async function getProfileByUser(req, res) {
    try {
        const { userId } = req.params;

        const users = await query('SELECT id FROM users WHERE id = ? LIMIT 1', [
            userId,
        ]);
        if (!users[0]) {
            return res.status(404).json('Usuario no encontrado');
        }

        const profiles = await query(
            `SELECT id, username, rating, photo_url, name, surname, phone, country, city, postal_code, biography, created_at, fk_usuarios_id
             FROM profiles
             WHERE fk_usuarios_id = ?
             LIMIT 1`,
            [userId],
        );

        if (!profiles[0]) {
            return res.status(404).json('Perfil no encontrado');
        }

        return res.json(profiles[0]);
    } catch (error) {
        return res.status(error.status).json(error.message);
    }
}

module.exports = {
    getProfileByUser,
};
