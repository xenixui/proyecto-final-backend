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
        if (!resolution) {
            return res
                .status(400)
                .json({ message: 'El campo resolution es obligatorio' });
        }
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

module.exports = { getReports, getReportById, resolveReport, retireArticle };
