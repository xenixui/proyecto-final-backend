const {getAll, search, getById, filter}  = require('../../controllers/articles.controller');
const router = require('express').Router();

//Recuperar todos los artículos
router.get('/', getAll); 

//Filtar artículos
router.get('/filter', filter);

//Buscar artículos
router.get('/search/:term', search);

//Obtener artículo por ID
router.get('/:article_id', getById);

module.exports = router; 