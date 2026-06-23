const express = require('express');
const reportController = require('../../controllers/reportUser.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const {
    reportUserParamsSchema,
    reportReasonBodySchema,
} = require('../../schemas/reportUser.schema');

const router = express.Router();

// POST /api/reports/users/:userId  →  reportar un usuario
router.post(
    '/users/:userId',
    authMiddleware,
    validateSchema(reportUserParamsSchema, 'params'),
    validateSchema(reportReasonBodySchema, 'body'),
    reportController.reportUser,
);

// GET /api/reports/mine  →  ver mis reportes de usuarios enviados
router.get(
    '/mine',
    authMiddleware,
    reportController.getMyUserReports,
);

module.exports = router;
