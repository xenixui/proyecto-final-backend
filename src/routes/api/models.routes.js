const { getByBrandId } = require('../../controllers/models.controller');
const router = require('express').Router();

router.get('/brand/:brandId', getByBrandId);

module.exports = router;