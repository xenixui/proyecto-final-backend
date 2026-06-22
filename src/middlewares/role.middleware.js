function requireRole(...allowedRoles) {
    return async function checkRole(req, res, next) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ message: 'No autenticado' });
            }

            if (!allowedRoles.includes(req.user.rol)) {
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
