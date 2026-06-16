const express = require('express');
const authController = require('../../controllers/auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const {
	loginSchema,
	changePasswordSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
} = require('../../schemas/auth.schema');

const router = express.Router();

router.post('/login', validateSchema(loginSchema), authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);
router.put('/password', authMiddleware, validateSchema(changePasswordSchema), authController.changePassword);

router.post('/forgot-password', validateSchema(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateSchema(resetPasswordSchema), authController.resetPassword);

module.exports = router;
