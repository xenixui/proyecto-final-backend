// src/controllers/reportController.js
// Thin controller — delega toda la lógica en reportService

const reportService = require("../services/reportService");

// POST /api/reports/articles/:articleId  →  reportar un artículo
const reportArticle = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { reason } = req.body;
    const result = await reportService.reportArticle(req.user.id, articleId, reason);
    res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
};

// GET /api/reports/mine  →  ver mis reportes enviados
const getMyReports = async (req, res, next) => {
  try {
    const data = await reportService.getMyReports(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = {
  reportArticle,
  getMyReports,
};
