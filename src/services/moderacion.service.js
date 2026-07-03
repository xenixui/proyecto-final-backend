const { withTransaction } = require('../config/database');
const reportsModel = require('../models/reports.model');
const articlesModel = require('../models/articles.model');
const profilesModel = require('../models/profiles.model');
const userModel = require('../models/user.model');
const notificationsModel = require('../models/notifications.model');

const MODERATION_CLOSE_MESSAGE =
    'Tu reporte ha sido revisado y cerrado sin acción';

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

async function markReportUnderReview(reportId, moderatorId) {
    const report = await reportsModel.getById(reportId);
    if (!report) {
        throw _error('Reporte no encontrado', 404);
    }
    _isReportResolved(report);

    await reportsModel.markUnderReview(reportId, { moderatorId });
}

async function rejectReport(id, moderatorId, { moderatorNote }) {
    const report = await reportsModel.getById(id);
    if (!report) {
        throw _error('Reporte no encontrado', 404);
    }
    _isReportResolved(report);

    await reportsModel.closeReport(id, {
        moderatorId,
        resolution: 'REJECTED',
        moderatorNote,
    });

    await _notifyModerationClose(report);
}

async function retireArticle(articleId, reportId, moderatorId) {
    const article = await articlesModel.getById(articleId);
    if (!article) {
        throw _error('Artículo no encontrado', 404);
    }
    if (article.status === 'RETIRED') {
        throw _error('El artículo ya está retirado', 409);
    }

    const report = await reportsModel.getById(reportId);
    if (!report) {
        throw _error('Reporte no encontrado', 404);
    }
    if (Number(report.article_id) !== Number(articleId)) {
        throw _error('El reporte no pertenece a este artículo', 409);
    }
    _isReportResolved(report);

    await withTransaction(async (connection) => {
        await articlesModel.retire(articleId, connection);
        await reportsModel.closeReport(
            reportId,
            { moderatorId, resolution: 'APPROVED' },
            connection,
        );
    });

    await notificationsModel.create({
        userId: report.seller_id,
        message: 'Artículo retirado por reporte',
        type: 'MODERATION',
        articleId: report.article_id,
        reportId: report.id,
    });
}

async function blockUser(userId, reportId, moderatorId) {
    const user = await userModel.getById(userId);
    if (!user) {
        throw _error('Usuario no encontrado', 404);
    }
    if (user.status === 'BLOCKED') {
        throw _error('El usuario ya está bloqueado', 409);
    }

    const report = await reportsModel.getById(reportId);
    if (!report) {
        throw _error('Reporte no encontrado', 404);
    }
    if (Number(report.reported_user_id) !== Number(userId)) {
        throw _error('El reporte no pertenece a este usuario', 409);
    }
    _isReportResolved(report);

    await withTransaction(async (connection) => {
        await profilesModel.blockUser(userId, connection);
        await reportsModel.closeReport(
            reportId,
            { moderatorId, resolution: 'APPROVED' },
            connection,
        );
    });
}

function _error(message, status) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function _isReportResolved(report) {
    if (report.resolved_at || report.status === 'RESOLVED') {
        throw _error('El reporte ya ha sido resuelto', 409);
    }
}

module.exports = {
    getReports,
    getReportsHistory,
    getReportById,
    markReportUnderReview,
    rejectReport,
    retireArticle,
    blockUser,
};
