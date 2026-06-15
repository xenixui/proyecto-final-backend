const router = require('express').Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const moderacionController = require('../../controllers/moderacion.controller');

const moderatorGuard = [authMiddleware, requireRole('MODERATOR', 'ADMINISTRATOR')];

// Listado de reportes
router.get('/reportes', ...moderatorGuard, moderacionController.getReports);

// Detalle de un reporte
router.get('/reportes/:id', ...moderatorGuard, moderacionController.getReportById);

// Resolver un reporte (body: { resolution: 'APPROVED'|'RETIRED', moderator_note? })
router.patch(
    '/reportes/:id/resolver',
    ...moderatorGuard,
    moderacionController.resolveReport,
);

// Retirar un artículo por moderación
router.patch(
    '/articulos/:id/retirar',
    ...moderatorGuard,
    moderacionController.retireArticle,
);

module.exports = router;
