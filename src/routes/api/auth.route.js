const express = require('express');
const authController = require('../../controllers/auth.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const { loginUserSchema } = require('../../schemas/auth.schema');

const router = express.Router();

router.post('/login', validateSchema(loginUserSchema), authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);
router.put('/password', authMiddleware, authController.changePassword);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
