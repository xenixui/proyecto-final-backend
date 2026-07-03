const express = require('express');
const reviewController = require('../../controllers/review.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const { createReviewSchema } = require('../../schemas/review.schema');

const router = express.Router();

router.post(
    '/',
    authMiddleware,
    validateSchema(createReviewSchema, 'body'),
    reviewController.createReview,
);

module.exports = router;