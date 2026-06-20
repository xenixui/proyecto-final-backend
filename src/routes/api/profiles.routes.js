const express = require('express');
const profileController = require('../../controllers/profile.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const {
    validateSchema
} = require('../../middlewares/validation.middleware');
const {
    getProfileByUserSchema,
    registerUserByAdminSchema
} = require('../../schemas/profile.schema');

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
    profileController.getProfiles);

router.get(
    '/:id/detail',
    authMiddleware,
    profileController.getProfileDetailById
)

router.post(
    '/',
    authMiddleware,
    validateSchema(registerUserByAdminSchema),
    profileController.createUser);


router.delete(
    '/:id',
    authMiddleware,
    profileController.deleteUser

);

router.patch(
    '/:id/block',
    authMiddleware,
    profileController.blockedUser
);

// Gestionar roles
//router.patch('/profiles/:id/role');
module.exports = router;