const router = require('express').Router();
const reportController = require('../../controllers/report.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const createReportSchema = require('../../schemas/report.schema');

router.post(
    '/',
    authMiddleware,
    validateSchema(createReportSchema, 'body'),
    reportController.createReport,
);

module.exports = router;
