const {getAll, search, getById, filter}  = require('../../controllers/articles.controller');
const router = require('express').Router();

//Recuperar todos los artículos
router.get('/', getAll); 
router.get('/filter', filter);
router.get('/search/:term', search);
router.get('/:article_id', getById);



module.exports = router; 