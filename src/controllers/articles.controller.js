const articlesService = require('../services/articles.service');

async function searchArticles(req, res) {
    try {
        const result = await articlesService.searchArticles(req.query);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.status).json(error.message);
    }
}

module.exports = {
    searchArticles,
};
