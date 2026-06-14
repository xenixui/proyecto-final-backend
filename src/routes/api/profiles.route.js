const express = require('express');
const profileController = require('../../controllers/profile.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const { getProfileByUserSchema } = require('../../schemas/profile.schema');

const router = express.Router();

router.get(
    '/:userId',
    authMiddleware,
    validateSchema(getProfileByUserSchema, 'params'),
    profileController.getProfileByUser,
);

module.exports = router;
