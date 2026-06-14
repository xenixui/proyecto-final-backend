const {getAll, search}  = require('../../controllers/articles.controller');
const router = require('express').Router();

//Recuperar todos los artículos
router.get('/', getAll); 
router.get('/search/:term', search);

module.exports = router; 