const express = require('express');
const stylesController = require('../../controllers/styles.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const checkRole = require('../../middlewares/rol.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const {
    styleIdParamSchema,
    createStyleSchema,
    updateStyleSchema,
} = require('../../schemas/style.schema');

const router = express.Router();

router.get('/', authMiddleware, stylesController.getAll);

router.get(
    '/:id',
    authMiddleware,
    validateSchema(styleIdParamSchema, 'params'),
    stylesController.getById,
);

router.post(
    '/',
    authMiddleware,
    checkRole('ADMINISTRATOR'),
    validateSchema(createStyleSchema),
    stylesController.create,
);

router.put(
    '/:id',
    authMiddleware,
    checkRole('ADMINISTRATOR'),
    validateSchema(styleIdParamSchema, 'params'),
    validateSchema(updateStyleSchema),
    stylesController.update,
);

router.delete(
    '/:id',
    authMiddleware,
    checkRole('ADMINISTRATOR'),
    validateSchema(styleIdParamSchema, 'params'),
    stylesController.remove,
);

module.exports = router;
