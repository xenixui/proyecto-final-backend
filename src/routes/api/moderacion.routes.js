const router = require('express').Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const moderacionController = require('../../controllers/moderacion.controller');
const {
    rejectReportSchema,
    retireArticleSchema,
    blockUserSchema,
} = require('../../schemas/moderacion.schema');

const moderatorGuard = [authMiddleware, requireRole('moderator', 'admin')];

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

// Marcar un reporte como en revisión
router.patch(
    '/reportes/:id/en_revision',
    ...moderatorGuard,
    moderacionController.markReportUnderReview,
);

// Rechazar un reporte
router.patch(
    '/reportes/:id/rechazar',
    ...moderatorGuard,
    validateSchema(rejectReportSchema),
    moderacionController.rejectReport,
);

// Retirar un artículo por moderación (body: { reportId })
router.patch(
    '/articulos/:id/retirar',
    ...moderatorGuard,
    validateSchema(retireArticleSchema),
    moderacionController.retireArticle,
);

// Bloquear un usuario por moderación (body: { reportId })
router.patch(
    '/usuario/:id/bloquear',
    ...moderatorGuard,
    validateSchema(blockUserSchema),
    moderacionController.blockUser,
);

module.exports = router;
