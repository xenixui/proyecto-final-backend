const {
    getAll,
    search,
    getById,
    getByUserIdAndStatus,
    filter,
    create,
    remove,
    update,
    markAsSold
} = require('../../controllers/articles.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const { createArticleSchema, updateArticleSchema } = require('../../schemas/articles.schema');
const router = require('express').Router();

//Recuperar todos los artículos
router.get('/', getAll);
router.get('/filter', filter);

//Buscar artículos
router.get('/search/:term', search);
router.get('/user/:userId', authMiddleware, getByUserIdAndStatus);

//Obtener artículo por ID
router.get('/:article_id', getById);

//Crear artículo
router.post('/', authMiddleware, validateSchema(createArticleSchema), create);

//Eliminar artículo
router.delete('/:article_id', authMiddleware, remove);

// Actualizar artículo
router.put('/:article_id', authMiddleware, validateSchema(updateArticleSchema), update);

//Marcar artículo como vendido
router.patch('/:article_id/sold', authMiddleware, markAsSold);

module.exports = router;
