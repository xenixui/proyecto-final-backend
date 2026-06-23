const {getAll, search, getById, filter, create, remove}  = require('../../controllers/articles.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { validateSchema } = require('../../middlewares/validation.middleware');
const { createArticleSchema } = require('../../schemas/articles.schema');
const router = require('express').Router();

//Recuperar todos los artículos
router.get('/', getAll); 
router.get('/filter', filter);
router.get('/search/:term', search);
router.get('/:article_id', getById);
router.post('/', authMiddleware, validateSchema(createArticleSchema), create);
router.delete('/:article_id', authMiddleware, remove);

module.exports = router; 