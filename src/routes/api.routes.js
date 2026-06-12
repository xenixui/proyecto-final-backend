const router = require('express').Router();

//Rutas de la API

router.use('/articles', require('./api/articles.routes'));

module.exports = router; 