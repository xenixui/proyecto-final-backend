const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    const user = await User.findByPk(payload.id, {
      attributes: { exclude: ['password'] },
    });

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