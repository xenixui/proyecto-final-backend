const router = require('express').Router();
const reportController = require('../../controllers/report.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const {
    createReportSchema,
    getReportsByStatusQuerySchema,
    reportIdParamSchema,
} = require('../../schemas/report.schema');

router.get(
    '/',
    authMiddleware,
    requireRole('admin'),
    validateSchema(getReportsByStatusQuerySchema, 'query'),
    reportController.getReportsByStatus,
);

router.get(
    '/:id',
    authMiddleware,
    requireRole('admin'),
    validateSchema(reportIdParamSchema, 'params'),
    reportController.getReportById,
);

router.post(
    '/',
    authMiddleware,
    validateSchema(createReportSchema, 'body'),
    reportController.createReport,
);

module.exports = router;
