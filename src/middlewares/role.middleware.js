const { query } = require('../config/database');

function requireRole(...allowedRoles) {
    return async function checkRole(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'No autenticado' });
            }

            const roles = await query(
                `SELECT r.rol FROM roles r
                 INNER JOIN users_roles ur ON ur.fk_roles_id = r.id
                 WHERE ur.fk_users_id = ?`,
                [userId],
            );

            const normalize = (role) => String(role).toUpperCase();
            const userRoles = roles.map((r) => normalize(r.rol));
            const requestedRoles = allowedRoles.map(normalize);
            const tokenRole = req.user.rol ? normalize(req.user.rol) : null;
            const hasRole =
                requestedRoles.some((role) => userRoles.includes(role)) ||
                (tokenRole && requestedRoles.includes(tokenRole));

            if (!hasRole) {
                return res.status(403).json({ message: 'Acceso denegado' });
            }

            next();
        } catch (error) {
            return res
                .status(500)
                .json({ message: error.message || 'Error al verificar rol' });
        }
    };
}

module.exports = requireRole;
module.exports.requireRole = requireRole;
