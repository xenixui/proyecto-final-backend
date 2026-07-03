const reviewModel = require('../models/review.model');

function createError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

async function createReview(buyerId, payload) {
    const article = await reviewModel.getArticleForReview(payload.article_id);

    if (!article) {
        throw createError(404, 'Artículo no encontrado');
    }

    if (article.status !== 'SOLD') {
        throw createError(400, 'Solo puedes valorar una venta completada');
    }

    if (Number(article.fk_buyer_id) !== Number(buyerId)) {
        throw createError(403, 'Solo el comprador puede valorar esta venta');
    }

    if (Number(article.seller_id) === Number(buyerId)) {
        throw createError(400, 'No puedes valorarte a ti mismo');
    }

    const existingReview = await reviewModel.getReviewByBuyerAndArticle(
        buyerId,
        payload.article_id,
    );

    if (existingReview) {
        throw createError(409, 'Ya has valorado esta venta');
    }

    return await reviewModel.createReview({
        stars: payload.stars,
        comentario: payload.comentario || null,
        buyerId,
        sellerId: article.seller_id,
        articleId: payload.article_id,
    });
}

module.exports = {
    createReview,
};