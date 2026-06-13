const express = require('express');
const authRoutes = require('./api/auth');
const usersRoutes = require('./api/users');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);

module.exports = router;
