const router = require('express').Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const {
    getArticulosPublicados,
    getArticulosVendidos,
    getUsuariosActivos,
    getReportesGestionados,
    getReportesPorEstado,
    getUsuariosPorEstado,
    getUsuariosPorFecha,
    getArticulosPorFecha,
} = require('../../controllers/stats.controller');

const adminOnly = [authMiddleware, requireRole('ADMINISTRATOR','admin')];

router.get('/articulos-publicados', ...adminOnly, getArticulosPublicados);
router.get('/articulos-vendidos', ...adminOnly, getArticulosVendidos);
router.get('/usuarios-activos', ...adminOnly, getUsuariosActivos);
router.get('/reportes-gestionados', ...adminOnly, getReportesGestionados);
router.get('/reportes-por-estado', ...adminOnly, getReportesPorEstado);
router.get('/usuarios-por-estado', ...adminOnly, getUsuariosPorEstado);
router.get('/usuarios-por-fecha', ...adminOnly, getUsuariosPorFecha);
router.get('/articulos-por-fecha', ...adminOnly, getArticulosPorFecha);

module.exports = router;
