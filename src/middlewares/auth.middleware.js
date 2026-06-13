const { verifyToken } = require('../utils/jwt');
const { query } = require('../config/database');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    let user;

    try {
      const users = await query(
        `SELECT id, email, rol, status, created_at, update_at, last_login
         FROM users
         WHERE id = ?
         LIMIT 1`,
        [payload.id]
      );
      user = users[0];
    } catch (error) {
      if (!error || error.code !== 'ER_BAD_FIELD_ERROR') {
        throw error;
      }

      const users = await query(
        `SELECT id, email, status, created_at, update_at, last_login
         FROM users
         WHERE id = ?
         LIMIT 1`,
        [payload.id]
      );

      if (users[0]) {
        user = {
          ...users[0],
          rol: 'USER',
        };
      }
    }

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ message: 'Usuario no autorizado' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Token inválido' });
  }
}

module.exports = authMiddleware;