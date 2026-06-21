const { getAll, search } = require('../../controllers/brands.controller');
const router = require('express').Router();

router.get('/', getAll);
router.get('/search/:term', search);

module.exports = router;
