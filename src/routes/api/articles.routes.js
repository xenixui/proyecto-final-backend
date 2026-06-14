const router = require('express').Router();
const { searchArticles } = require('../../controllers/articles.controller');
const { validateSchema } = require('../../middlewares/validation.middleware');
const { articleSearchSchema } = require('../../schemas/articles.schema');

router.get(
    '/search',
    validateSchema(articleSearchSchema, 'query'),
    searchArticles,
);

module.exports = router;
