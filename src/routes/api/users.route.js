const express = require('express');
const userController = require('../../controllers/user.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const { registerUserSchema } = require('../../schemas/user.schema');

const router = express.Router();

router.post('/register', validateSchema(registerUserSchema), userController.register);
router.get('/my-posts', authMiddleware, userController.getMyPosts);

module.exports = router;
