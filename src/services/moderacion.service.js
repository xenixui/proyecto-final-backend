const reportsModel = require('../models/reports.model');
const articlesModel = require('../models/articles.model');
const notificationsModel = require('../models/notifications.model');

const MODERATION_CLOSE_MESSAGE = 'Tu reporte ha sido revisado y cerrado sin acción';

function _error(message, status) {
    const error = new Error(message);
    error.status = status;
    return error;
}

async function _notifyModerationClose(report) {
    await notificationsModel.create({
        userId: report.reporter_id,
        message: MODERATION_CLOSE_MESSAGE,
        type: 'MODERATION',
        articleId: report.article_id,
        reportId: report.id,
    });
}

async function getReports(page, limit) {
    return reportsModel.getAll(page, limit);
}

async function getReportsHistory(page, limit) {
    return reportsModel.getHistory(page, limit);
}

async function getReportById(id) {
    const report = await reportsModel.getById(id);
    if (!report) throw _error('Reporte no encontrado', 404);
    return report;
}

async function resolveReport(id, moderatorId, { resolution, moderatorNote }) {
    const report = await reportsModel.getById(id);
    if (!report) throw _error('Reporte no encontrado', 404);
    if (report.resolved_at) throw _error('El reporte ya ha sido resuelto', 409);

    await reportsModel.resolve(id, { moderatorId, resolution, moderatorNote });

    if (resolution === 'RETIRED') {
        await notificationsModel.create({
            userId: report.seller_id,
            message: 'Artículo retirado por reporte',
            type: 'MODERATION',
            articleId: report.article_id,
            reportId: report.id,
        });
    } else {
        await _notifyModerationClose(report);
    }

    return { message: 'Reporte resuelto correctamente' };
}

async function rejectReport(id, moderatorId, { moderatorNote }) {
    const report = await reportsModel.getById(id);
    if (!report) throw _error('Reporte no encontrado', 404);
    if (report.resolved_at) throw _error('El reporte ya ha sido resuelto', 409);

    await reportsModel.reject(id, { moderatorId, moderatorNote });

    await _notifyModerationClose(report);

    return { message: 'Reporte rechazado correctamente' };
}

async function retireArticle(id) {
    const article = await articlesModel.getById(id);
    if (!article) throw _error('Artículo no encontrado', 404);
    if (article.status === 'RETIRED') {
        throw _error('El artículo ya está retirado', 409);
    }

    await articlesModel.retire(id);
    return { message: 'Artículo retirado correctamente' };
}

module.exports = {
    getReports,
    getReportsHistory,
    getReportById,
    resolveReport,
    rejectReport,
    retireArticle,
};
