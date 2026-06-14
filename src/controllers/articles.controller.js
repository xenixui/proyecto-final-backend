const ArticleModel = require('../models/articles.model');

async function getAll(req, res) {
    try {
        const result = await ArticleModel.getAll();
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar los artículos',
            error: error.message
        });
    }
}

module.exports = {
    getAll
}