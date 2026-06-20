const router = require('express').Router();

//Rutas de la API

router.use('/auth', require('./api/auth.routes'));
router.use('/articles', require('./api/articles.routes'));
router.use('/profiles', require('./api/profiles.routes'));
router.use('/users', require('./api/users.routes'));
router.use('/stats', require('./api/stats.routes'));

module.exports = router;
