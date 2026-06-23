const express = require('express');
const stylesController = require('../../controllers/styles.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const {
    styleIdParamSchema,
    styleSearchParamSchema,
    createStyleSchema,
    updateStyleSchema,
} = require('../../schemas/style.schema');

const router = express.Router();

router.get('/', authMiddleware, stylesController.getAll);

router.get(
    '/search/:term',
    authMiddleware,
    validateSchema(styleSearchParamSchema, 'params'),
    stylesController.searchByName,
);

router.get(
    '/:id',
    authMiddleware,
    validateSchema(styleIdParamSchema, 'params'),
    stylesController.getById,
);

router.post(
    '/',
    authMiddleware,
    requireRole('ADMINISTRATOR'),
    validateSchema(createStyleSchema),
    stylesController.create,
);

router.put(
    '/:id',
    authMiddleware,
    requireRole('ADMINISTRATOR'),
    validateSchema(styleIdParamSchema, 'params'),
    validateSchema(updateStyleSchema),
    stylesController.update,
);

router.delete(
    '/:id',
    authMiddleware,
    requireRole('ADMINISTRATOR'),
    validateSchema(styleIdParamSchema, 'params'),
    stylesController.remove,
);

module.exports = router;
