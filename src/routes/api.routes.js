const router = require('express').Router();

//Rutas de la API

router.use('/auth', require('./api/auth.routes'));
router.use('/articles', require('./api/articles.routes'));

module.exports = router; 