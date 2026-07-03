const reviewService = require('../services/review.service');

async function createReview(req, res, next) {
    try {
        const review = await reviewService.createReview(req.user.id, req.body);
        return res.status(201).json(review);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createReview,
};