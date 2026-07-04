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
            message:
                error.message || 'Error al obtener el histórico de reportes',
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

async function markReportUnderReview(req, res) {
    try {
        await moderacionService.markReportUnderReview(
            req.params.id,
            req.user.id,
        );
        return res.sendStatus(204);
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Error al marcar el reporte en revisión',
        });
    }
}

async function updateModeratorNote(req, res) {
    try {
        const { moderator_note } = req.body;
        const result = await moderacionService.updateModeratorNote(
            req.params.id,
            req.user.id,
            { moderatorNote: moderator_note },
        );
        return res.json(result);
    } catch (error) {
        return res.status(error.status || 500).json({
            message:
                error.message || 'Error al actualizar la nota del moderador',
        });
    }
}

async function rejectReport(req, res) {
    try {
        const { moderator_note } = req.body;
        await moderacionService.rejectReport(req.params.id, req.user.id, {
            moderatorNote: moderator_note,
        });
        return res.sendStatus(204);
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Error al rechazar el reporte',
        });
    }
}

async function retireArticle(req, res) {
    try {
        await moderacionService.retireArticle(
            req.params.id,
            req.body.reportId,
            req.user.id,
        );
        return res.sendStatus(204);
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Error al retirar el artículo',
        });
    }
}

async function blockUser(req, res) {
    try {
        await moderacionService.blockUser(
            req.params.id,
            req.body.reportId,
            req.user.id,
        );
        return res.sendStatus(204);
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Error al bloquear el usuario',
        });
    }
}

module.exports = {
    getReports,
    getReportsHistory,
    getReportById,
    markReportUnderReview,
    updateModeratorNote,
    rejectReport,
    retireArticle,
    blockUser,
};
