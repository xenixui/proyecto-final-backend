const express = require('express');
const authController = require('../../controllers/auth.controller');
const userController = require('../../controllers/user.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const { registerUserSchema } = require('../../schemas/user.schema');

const router = express.Router();


router.post('/register', validateSchema(registerUserSchema), userController.register);
router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);
router.put('/password', authMiddleware, authController.changePassword);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
