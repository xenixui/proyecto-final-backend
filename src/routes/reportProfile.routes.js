// src/routes/reportRoutes.js

const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddleware"); // sin llaves, exportación directa
const { reportArticle, getMyReports } = require("../controllers/reportController");

const router = Router();

// Todas las rutas requieren estar autenticado
router.use(authMiddleware);

// POST /api/reports/articles/:articleId  →  reportar un artículo
router.post("/articles/:articleId", reportArticle);

// GET  /api/reports/mine               →  ver mis reportes enviados
router.get("/mine", getMyReports);

module.exports = router;
