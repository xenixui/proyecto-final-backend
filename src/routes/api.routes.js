const router = require('express').Router;

//Rutas de la API

router.use('/explore', require('./api/explore.routes'));

module.exports = router; 