const express = require('express');
const profileController = require('../../controllers/profile.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const {
    validateSchema
} = require('../../middlewares/validation.middleware');
const {
    getProfileByUserSchema,
    registerUserByAdminSchema,
    assignRoleSchema,
    updateProfileBodySchema
} = require('../../schemas/profile.schema');
const requireRole = require('../../middlewares/role.middleware');
const {
    uploadProfilePhoto,
    handleUploadErrors,
} = require('../../middlewares/upload.middleware');

const router = express.Router();

router.get(
    '/:userId',
    authMiddleware,
    validateSchema(getProfileByUserSchema, 'params'),
    profileController.getProfileByUser,
);


router.get(
    '/',
    authMiddleware,
    requireRole('admin'),
    profileController.getProfiles
);

router.get(
    '/:id/detail',
    authMiddleware,
    requireRole('admin'),
    profileController.getProfileDetailById
)

router.post(
    '/',
    authMiddleware,
    requireRole('admin'),
    validateSchema(registerUserByAdminSchema, 'body'),
    profileController.createUser);


router.delete(
    '/:id',
    authMiddleware,
    requireRole('admin'),
    profileController.deleteUser

);

router.patch(
    '/:id/block',
    authMiddleware,
    requireRole('admin'),
    profileController.blockedUser
);

router.post(
    '/:id/roles',
    authMiddleware,
    requireRole('admin'),
    validateSchema(assignRoleSchema, 'body'),
    profileController.assignedRole
);

router.delete(
    '/:id/roles/:roleId',
    authMiddleware,
    requireRole('admin'),
    profileController.removedRole
)

// PUT /api/profile  →  editar mi perfil
router.put(
    '/',
    authMiddleware,
    validateSchema(updateProfileBodySchema, 'body'),
    profileController.updateProfile,
);

// POST /api/profiles/photo  →  subir foto de perfil
router.post(
    '/photo',
    authMiddleware,
    uploadProfilePhoto,
    handleUploadErrors,
    profileController.uploadPhoto,
);

// DELETE /api/profiles/photo  →  eliminar foto de perfil
router.delete(
    '/photo',
    authMiddleware,
    profileController.deletePhoto,
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