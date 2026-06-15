const { query } = require('../config/database');

function requireRole(...allowedRoles) {
  return async function roleMiddleware(req, res, next) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'No autenticado' });
      }

      const roles = await query(
        `SELECT r.rol
         FROM roles r
         INNER JOIN users_roles ur ON ur.fk_roles_id = r.id
         WHERE ur.fk_users_id = ?`,
        [req.user.id],
      );

      const userRoles = roles.map((r) => r.rol);
      const hasRole = allowedRoles.some((role) => userRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({ message: 'Acceso denegado: rol no autorizado' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = requireRole;
