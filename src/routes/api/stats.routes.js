const router = require('express').Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const {
    getArticulosPublicados,
    getArticulosVendidos,
    getUsuariosActivos,
} = require('../../controllers/stats.controller');

const adminOnly = [authMiddleware, requireRole('ADMINISTRATOR')];

router.get('/articulos-publicados', ...adminOnly, getArticulosPublicados);
router.get('/articulos-vendidos', ...adminOnly, getArticulosVendidos);
router.get('/usuarios-activos', ...adminOnly, getUsuariosActivos);

module.exports = router;
