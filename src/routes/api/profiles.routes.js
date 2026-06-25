const express = require('express');
const profileController = require('../../controllers/profile.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const {
    getProfileByUserSchema,
    registerUserByAdminSchema,
    assignRoleSchema,
    updateProfileBodySchema,
} = require('../../schemas/profile.schema');
const requireRole = require('../../middlewares/role.middleware');

const router = express.Router();

// ─── Rutas fijas (deben ir antes de /:userId para evitar colisiones) ───

router.get(
    '/',
    authMiddleware,
    requireRole('admin'),
    profileController.getProfiles,
);

router.post(
    '/',
    authMiddleware,
    requireRole('admin'),
    validateSchema(registerUserByAdminSchema, 'body'),
    profileController.createUser,
);

// PUT /api/profiles  →  editar mi perfil
router.put(
    '/',
    authMiddleware,
    validateSchema(updateProfileBodySchema, 'body'),
    profileController.updateProfile,
);

// GET /api/profiles/articles -> mis artículos publicados
router.get('/articles', authMiddleware, profileController.getMyArticles);

// GET /api/profiles/orders/purchases -> mis compras
router.get(
    '/orders/purchases',
    authMiddleware,
    profileController.getMyPurchases,
);

// GET /api/profiles/orders/sales -> mis ventas
router.get('/orders/sales', authMiddleware, profileController.getMySales);

// GET /api/profiles/chats -> mis chats (comprador o vendedor)
router.get('/chats', authMiddleware, profileController.getMyChats);

// ─── Rutas admin con parámetros específicos ───────────────────────────

router.get(
    '/:id/detail',
    authMiddleware,
    requireRole('admin'),
    profileController.getProfileDetailById,
);

router.delete(
    '/:id',
    authMiddleware,
    requireRole('admin'),
    profileController.deleteUser,
);

router.patch(
    '/:id/block',
    authMiddleware,
    requireRole('admin'),
    profileController.blockedUser,
);

router.post(
    '/:id/roles',
    authMiddleware,
    requireRole('admin'),
    validateSchema(assignRoleSchema, 'body'),
    profileController.assignedRole,
);

router.delete(
    '/:id/roles/:roleId',
    authMiddleware,
    requireRole('admin'),
    profileController.removedRole,
);

// PUT /api/profiles/:userId  →  admin edita el perfil de cualquier usuario
router.put(
    '/:userId',
    authMiddleware,
    requireRole('admin'),
    validateSchema(getProfileByUserSchema, 'params'),
    validateSchema(updateProfileBodySchema, 'body'),
    profileController.updateProfileByUserId,
);

// GET /api/profiles/:userId  →  obtener perfil por userId
router.get(
    '/:userId',
    authMiddleware,
    validateSchema(getProfileByUserSchema, 'params'),
    profileController.getProfileByUser,
);

module.exports = router;
