const { createChat, getAll } = require('../controllers/chats.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = require('express').Router();

router.get('/', authMiddleware, getAll)

router.post('/', authMiddleware, createChat)

module.exports = router;
