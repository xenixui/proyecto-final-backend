const express = require('express');
const authRoutes = require('./api/auth.route');
const usersRoutes = require('./api/users.route');
const articlesRoutes = require('./api/articles.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/articles', articlesRoutes);

module.exports = router;
