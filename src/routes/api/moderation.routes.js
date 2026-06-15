const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const { resolveReportSchema, idParamSchema } = require('../../schemas/moderation.schema');
const {
  getReports,
  getReportById,
  resolveReport,
  retireArticle,
} = require('../../controllers/moderation.controller');

const router = express.Router();

const canModerate = [authMiddleware, requireRole('MODERATOR', 'ADMINISTRATOR')];

// GET /api/moderacion/reportes?status=PENDING
router.get('/reportes', ...canModerate, getReports);

// GET /api/moderacion/reportes/:id
router.get(
  '/reportes/:id',
  ...canModerate,
  validateSchema(idParamSchema, 'params'),
  getReportById,
);

// PATCH /api/moderacion/reportes/:id/resolver
router.patch(
  '/reportes/:id/resolver',
  ...canModerate,
  validateSchema(idParamSchema, 'params'),
  validateSchema(resolveReportSchema),
  resolveReport,
);

// PATCH /api/moderacion/articulos/:id/retirar
router.patch(
  '/articulos/:id/retirar',
  ...canModerate,
  validateSchema(idParamSchema, 'params'),
  retireArticle,
);

module.exports = router;
