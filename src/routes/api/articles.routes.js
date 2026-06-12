const {getAll}  = require('../../controllers/articles.controller');
const router = require('express').Router();

//RuRecuperar todos los artículos
router.get('/', getAll); 

module.exports = router; 