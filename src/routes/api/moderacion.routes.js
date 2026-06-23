const router = require('express').Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const moderacionController = require('../../controllers/moderacion.controller');
const {
    resolveReportSchema,
    rejectReportSchema,
} = require('../../schemas/moderacion.schema');

const moderatorGuard = [authMiddleware, requireRole('MODERATOR', 'ADMINISTRATOR')];

// Listado de reportes activos
router.get('/reportes', ...moderatorGuard, moderacionController.getReports);

// Histórico de reportes resueltos
router.get(
    '/reportes/historial',
    ...moderatorGuard,
    moderacionController.getReportsHistory,
);

// Detalle de un reporte
router.get('/reportes/:id', ...moderatorGuard, moderacionController.getReportById);

// Resolver un reporte (body: { resolution: 'APPROVED'|'RETIRED', moderator_note? })
router.patch(
    '/reportes/:id/resolver',
    ...moderatorGuard,
    validateSchema(resolveReportSchema),
    moderacionController.resolveReport,
);

// Rechazar un reporte
router.patch(
    '/reportes/:id/rechazar',
    ...moderatorGuard,
    validateSchema(rejectReportSchema),
    moderacionController.rejectReport,
);

// Retirar un artículo por moderación
router.patch(
    '/articulos/:id/retirar',
    ...moderatorGuard,
    moderacionController.retireArticle,
);

module.exports = router;
