const router = require('express').Router();
const usersRoutes = require('./api/users.route');

//Rutas de la API

router.use('/auth', require('./api/auth.routes'));
router.use('/articles', require('./api/articles.routes'));
router.use('/users', usersRoutes);
router.use('/moderacion', require('./api/moderation.routes'));

module.exports = router;
