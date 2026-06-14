const express = require('express');
const authRoutes = require('./api/auth.route');
const profilesRoutes = require('./api/profiles.route');
const usersRoutes = require('./api/users.route');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/profiles', profilesRoutes);
router.use('/users', usersRoutes);

module.exports = router;
