const express = require('express');
const profileController = require('../../controllers/profile.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const { getProfileByUserSchema, updateProfileBodySchema } = require('../../schemas/profile.schema');

const router = express.Router();

router.get(
    '/:userId',
    authMiddleware,
    validateSchema(getProfileByUserSchema, 'params'),
    profileController.getProfileByUser,
);

// PUT /api/profile  →  editar mi perfil
router.put(
    '/',
    authMiddleware,
    validateSchema(updateProfileBodySchema, 'body'),
    profileController.updateProfile,
);

// GET /api/profile/articles -> mis artículos publicados
router.get(
    '/articles',
    authMiddleware,
    profileController.getMyArticles,
);

// GET /api/profile/orders/purchases -> mis compras
router.get(
    '/orders/purchases',
    authMiddleware,
    profileController.getMyPurchases,
);

// GET /api/profile/orders/sales ->mis ventas
router.get(
    '/orders/sales',
    authMiddleware,
    profileController.getMySales,
);

// GET /api/profile/chats -> mis chats (comprador o vendedor)
router.get(
    '/chats',
    authMiddleware,
    profileController.getMyChats,
);

module.exports = router;
