const reportModel = require('../models/reports.model')

function createError(message, status) {
    const error = new Error(message);
    error.status = status;
    return error;
}

async function createReport(data) {
    const article = await reportModel.getArticleForReport(data.fk_articles_id);

    if (!article) {
        throw createError('Artículo no encontrado', 404);
    }

    if (Number(article.fk_users_id) === Number(data.fk_users_id)) {
        throw createError('No puedes reportar tu propio artículo', 400);
    }

    const report = await reportModel.insertReport(
        data.reason,
        data.comments,
        data.fk_articles_id,
        data.fk_users_id)
        
    return report
}

module.exports = {
    createReport
}
