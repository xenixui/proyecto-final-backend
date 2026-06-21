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

    const users = await query(
      `SELECT id, email, status, created_at, update_at, last_login
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [payload.id]
    );

    const user = users[0];

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ message: 'Usuario no autorizado' });
    }

    req.user = {
      ...user,
      rol: payload.rol || 'USER',
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Token inválido' });
  }
}

module.exports = authMiddleware;