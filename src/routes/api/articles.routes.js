const {
    getAll,
    search,
    getById,
    getSimilar,
    getByUserIdAndStatus,
    filter,
    create,
    remove,
    update,
    markAsSold,
    uploadImages,
    addFavorite,
    removeFavorite,
    deleteImages,
} = require('../../controllers/articles.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const optionalAuthMiddleware = require('../../middlewares/optionalAuth.middleware');
const {
    uploadArticleImages,
    handleUploadErrors,
} = require('../../middlewares/upload.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const { createArticleSchema, updateArticleSchema, deleteArticleImagesSchema } = require('../../schemas/articles.schema');
const router = require('express').Router();

//Recuperar todos los artículos
router.get('/', getAll);
router.get('/filter', filter);

//Buscar artículos
router.get('/search/:term', search);
router.get('/user/:userId', authMiddleware, getByUserIdAndStatus);

//Obtener artículo por ID
router.get('/:article_id', optionalAuthMiddleware, getById);

//Obtener artículos similares (mismo estilo o marca)
router.get('/:article_id/similares', optionalAuthMiddleware, getSimilar);

//Favoritos
router.post('/:article_id/favoritos', authMiddleware, addFavorite);
router.delete('/:article_id/favoritos', authMiddleware, removeFavorite);

//Crear artículo
router.post('/', authMiddleware, validateSchema(createArticleSchema), create);

//Subir imágenes de un artículo
router.post(
    '/:article_id/images',
    authMiddleware,
    uploadArticleImages,
    handleUploadErrors,
    uploadImages,
);

//Eliminar imágenes de un artículo
router.delete(
    '/:article_id/images',
    authMiddleware,
    validateSchema(deleteArticleImagesSchema),
    deleteImages,
);

//Eliminar artículo
router.delete('/:article_id', authMiddleware, remove);

// Actualizar artículo
router.put('/:article_id', authMiddleware, validateSchema(updateArticleSchema), update);

//Marcar artículo como vendido
router.patch('/:article_id/sold', authMiddleware, markAsSold);

module.exports = router;
