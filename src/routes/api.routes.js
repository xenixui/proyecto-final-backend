const router = require('express').Router();

//Rutas de la API

router.use('/auth', require('./api/auth.routes'));
router.use('/articles', require('./api/articles.routes'));
router.use("/users", usersRoutes);
router.use("/admin", require('./api/admin.routes'));
router.use('/profiles', require('./api/profiles.routes'));
router.use('/users', require('./api/users.routes'));

module.exports = router;
