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
    markAsReserved,
    markAsPublished,
    markAsSold,
    publish,
    uploadImages,
    deleteImages,
} = require('../../controllers/articles.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
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
router.get('/:article_id', getById);

//Obtener artículos similares (mismo estilo o marca)
router.get('/:article_id/similares', getSimilar);

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

// Cambiar estado del artículo desde el chat de venta
router.patch('/:article_id/reserved', authMiddleware, markAsReserved);
router.patch('/:article_id/published', authMiddleware, markAsPublished);
router.patch('/:article_id/sold', authMiddleware, markAsSold);

//Publicar un artículo que está en borrador
router.patch('/:article_id/publish', authMiddleware, publish);

module.exports = router;
