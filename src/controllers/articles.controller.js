const ArticleModel = require('../models/articles.model');

async function getAll(req, res) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        
        const result = await ArticleModel.getAll(page, limit);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar los artículos',
            error: error.message
        });
    }
}

async function getById(req, res) {
    try {
        
        const result = await ArticleModel.getById(req.params.article_id)
        if(!result) {
            return res.status(404).json({
                message: 'No existe artículo con este ID',
            });
        }
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar al artículo',
            error: error.message
        });
    }
}


async function search(req, res) {
    try {
        const { term } = req.params;
        
        if (!term) {
            return res.status(400).json({
                message: 'El término de búsqueda es obligatorio'
            });
        }
        
        const result = await ArticleModel.search(term);

        if (result.length === 0) {
            return res.status(404).json({
                message: 'No se han encontrado resultados'
            });
        }

        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al buscar artículos',
            error: error.message
        });
    }
}

module.exports = {
    getAll, 
    getById,
    search
}