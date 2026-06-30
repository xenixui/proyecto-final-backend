const { verifyToken } = require('../utils/jwt');
const { query } = require('../config/database');

// Igual que authMiddleware, pero si no hay token (o es inválido) deja pasar
// la petición sin req.user en vez de devolver 401. (p.ej. saber si
// un artículo ya es favorito del usuario que hace la petición).
async function optionalAuthMiddleware(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);

        const users = await query(
            `SELECT id, status FROM users WHERE id = ? LIMIT 1`,
            [payload.id],
        );

        if (users[0]?.status === 'ACTIVE') {
            req.user = users[0];
        }

        next();
    } catch (_error) {
        next();
    }
}

module.exports = optionalAuthMiddleware;
