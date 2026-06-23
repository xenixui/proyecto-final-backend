const express = require('express');
const profileController = require('../../controllers/profile.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const {
    validateSchema
} = require('../../middlewares/validation.middleware');
const {
    getProfileByUserSchema,
    registerUserByAdminSchema,
    assignRoleSchema
} = require('../../schemas/profile.schema');
const requireRole = require('../../middlewares/role.middleware');

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

module.exports = router;