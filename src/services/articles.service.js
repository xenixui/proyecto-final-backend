const articlesModel = require('../models/articles.model');

async function searchArticles(filters) {
    const articles = await articlesModel.searchArticles(filters);

    return {
        articles,
    };
}

module.exports = {
    searchArticles,
};
