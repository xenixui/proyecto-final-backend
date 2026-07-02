const express = require('express');
const {
    getProfiles,
    createUser,
    updateProfile,
    uploadPhoto,
    deletePhoto,
    getMyArticles,
    getMyPurchases,
    getMySales,
    getMyChats,
    getProfileDetailById,
    deleteUser,
    blockedUser,
    unblockedUser,
    assignedRole,
    removedRole,
    getUserRoles,
    updateProfileByUserId,
    getProfileByUser,
} = require('../../controllers/profile.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const {
    getProfileByUserSchema,
    registerUserByAdminSchema,
    assignRoleSchema,
    updateProfileBodySchema,
} = require('../../schemas/profile.schema');
const requireRole = require('../../middlewares/role.middleware');
const {
    uploadProfilePhoto,
    handleUploadErrors,
} = require('../../middlewares/upload.middleware');

const router = express.Router();

// ─── Rutas fijas (deben ir antes de /:userId para evitar colisiones) ───

router.get('/', authMiddleware, requireRole('admin'), getProfiles);

router.post(
    '/',
    authMiddleware,
    requireRole('admin'),
    validateSchema(registerUserByAdminSchema, 'body'),
    createUser,
);

// PUT /api/profiles  →  editar mi perfil
router.put(
    '/',
    authMiddleware,
    validateSchema(updateProfileBodySchema, 'body'),
    updateProfile,
);

// POST /api/profiles/photo  →  subir foto de perfil
router.post(
    '/photo',
    authMiddleware,
    uploadProfilePhoto,
    handleUploadErrors,
    uploadPhoto,
);

// DELETE /api/profiles/photo  →  eliminar foto de perfil
router.delete('/photo', authMiddleware, deletePhoto);

// GET /api/profile/articles -> mis artículos publicados
router.get('/articles', authMiddleware, getMyArticles);

// GET /api/profiles/orders/purchases -> mis compras
router.get('/orders/purchases', authMiddleware, getMyPurchases);

// GET /api/profiles/orders/sales -> mis ventas
router.get('/orders/sales', authMiddleware, getMySales);

// GET /api/profiles/chats -> mis chats (comprador o vendedor)
router.get('/chats', authMiddleware, getMyChats);

// ─── Rutas admin con parámetros específicos ───────────────────────────

router.get(
    '/:id/detail',
    authMiddleware,
    requireRole('admin'),
    getProfileDetailById,
);

router.get(
    '/:id/roles',
    authMiddleware,
    requireRole('admin'),
    getUserRoles,
);

router.delete('/:id', 
    authMiddleware, 
    requireRole('admin'), 
    deleteUser);

router.patch('/:id/block', 
    authMiddleware, 
    requireRole('admin'), 
    blockedUser);

router.patch('/:id/unblock', 
    authMiddleware, 
    requireRole('admin'), 
    unblockedUser);

router.post(
    '/:id/roles',
    authMiddleware,
    requireRole('admin'),
    validateSchema(assignRoleSchema, 'body'),
    assignedRole,
);

router.delete(
    '/:id/roles/:roleId',
    authMiddleware,
    requireRole('admin'),
    removedRole,
);

// PUT /api/profiles/:userId  →  admin edita el perfil de cualquier usuario
router.put(
    '/:userId',
    authMiddleware,
    requireRole('admin'),
    validateSchema(getProfileByUserSchema, 'params'),
    validateSchema(updateProfileBodySchema, 'body'),
    updateProfileByUserId,
);

// GET /api/profiles/:userId  →  obtener perfil por userId
router.get(
    '/:userId',
    authMiddleware,
    validateSchema(getProfileByUserSchema, 'params'),
    getProfileByUser,
);

module.exports = router;
