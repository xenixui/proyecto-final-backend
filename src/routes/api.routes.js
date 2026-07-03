const router = require('express').Router();

//Rutas de la API

router.use('/auth', require('./api/auth.routes'));
router.use('/articles', require('./api/articles.routes'));
router.use('/moderacion', require('./api/moderacion.routes'));
router.use('/brands', require('./api/brands.routes'));
router.use('/models', require('./api/models.routes'));
router.use('/profiles', require('./api/profiles.routes'));
router.use('/users', require('./api/users.routes'));
router.use('/stats', require('./api/stats.routes'));
router.use('/styles', require('./api/styles.routes'));
router.use('/chats', require('./api/chat.routes'));
router.use('/reports', require('./api/report.routes'));
router.use('/reviews', require('./api/reviews.routes'));
router.use('/profile', require('./api/reportUser.routes'));

module.exports = router;
