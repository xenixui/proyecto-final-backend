const moderacionService = require('../services/moderacion.service');

async function getReports(req, res) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const result = await moderacionService.getReports(page, limit);
        return res.json(result);
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Error al obtener reportes',
        });
    }
}

async function getReportsHistory(req, res) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const result = await moderacionService.getReportsHistory(page, limit);
        return res.json(result);
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Error al obtener el histórico de reportes',
        });
    }
}

async function getReportById(req, res) {
    try {
        const result = await moderacionService.getReportById(req.params.id);
        return res.json(result);
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Error al obtener el reporte',
        });
    }
}

async function resolveReport(req, res) {
    try {
        const { resolution, moderator_note } = req.body;
        const result = await moderacionService.resolveReport(
            req.params.id,
            req.user.id,
            { resolution, moderatorNote: moderator_note },
        );
        return res.json(result);
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Error al resolver el reporte',
        });
    }
}

async function rejectReport(req, res) {
    try {
        const { moderator_note } = req.body;
        const result = await moderacionService.rejectReport(
            req.params.id,
            req.user.id,
            { moderatorNote: moderator_note },
        );
        return res.json(result);
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Error al rechazar el reporte',
        });
    }
}

async function retireArticle(req, res) {
    try {
        const result = await moderacionService.retireArticle(req.params.id);
        return res.json(result);
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Error al retirar el artículo',
        });
    }
}

module.exports = {
    getReports,
    getReportsHistory,
    getReportById,
    resolveReport,
    rejectReport,
    retireArticle,
};
