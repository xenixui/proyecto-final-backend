const express = require('express');
const reportController = require('../../controllers/reportUser.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const {
    reportUserParamsSchema,
    reportReasonBodySchema,
} = require('../../schemas/reportUser.schema');

const router = express.Router();

// POST /api/profiles/:userId/reportes  →  reportar un usuario
router.post(
    '/:userId/reportes',
    authMiddleware,
    validateSchema(reportUserParamsSchema, 'params'),
    validateSchema(reportReasonBodySchema, 'body'),
    reportController.reportUser,
);

// GET /api/profiles/reportes/mine  →  ver mis reportes de usuarios enviados
router.get(
    '/reportes/mine',
    authMiddleware,
    reportController.getMyUserReports,
);

module.exports = router;
