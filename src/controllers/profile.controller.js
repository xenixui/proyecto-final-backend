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

// PUT /api/profile  →  actualiza los datos editables del perfil
async function updateProfile(req, res, next) {
    try {
        const data = await profileService.updateProfile(req.user.id, req.body);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

// ─── Artículos y pedidos ──────────────────────────────────────

// GET /api/profile/articles  →  relojes que el usuario tiene publicados
async function getMyArticles(req, res, next) {
    try {
        const data = await profileService.getMyArticles(req.user.id);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

// GET /api/profile/orders/purchases  →  artículos que el usuario ha comprado (status SOLD)
async function getMyPurchases(req, res, next) {
    try {
        const data = await profileService.getMyPurchases(req.user.id);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

// GET /api/profile/orders/sales  →  artículos del usuario que han sido vendidos
async function getMySales(req, res, next) {
    try {
        const data = await profileService.getMySales(req.user.id);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

// ─── Chats ────────────────────────────────────────────────────

// GET /api/profile/chats  →  todas las conversaciones del usuario (como comprador o vendedor)
async function getMyChats(req, res, next) {
    try {
        const data = await profileService.getMyChats(req.user.id);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getProfileByUser,
    updateProfile,
    getMyArticles,
    getMyPurchases,
    getMySales,
    getMyChats,
};