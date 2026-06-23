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
            error: error.message,
        });
    }
}

async function getById(req, res) {
    try {
        const result = await ArticleModel.getById(req.params.article_id);
        if (!result) {
            return res.status(404).json({
                message: 'No existe artículo con este ID',
            });
        }
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar al artículo',
            error: error.message,
        });
    }
}

async function search(req, res) {
    try {
        const { term } = req.params;

        if (!term) {
            return res.status(400).json({
                message: 'El término de búsqueda es obligatorio',
            });
        }

        const result = await ArticleModel.search(term);

        if (result.length === 0) {
            return res.status(404).json({
                message: 'No se han encontrado resultados',
            });
        }

        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al buscar artículos',
            error: error.message,
        });
    }
}

async function filter(req, res) {
    try {
        const filters = {
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            brandId: req.query.brandId,
            modelId: req.query.modelId,
            styleId: req.query.styleId,
            gender: req.query.gender,
            movementType: req.query.movementType,
            yearOfManufacture: req.query.yearOfManufacture,
            condition: req.query.condition,
            originalBox: req.query.originalBox === 'true' ? 1 : undefined,
            originalPapers: req.query.originalPapers === 'true' ? 1 : undefined,
            shippingAvailable:
                req.query.shippingAvailable === 'true'
                    ? 1
                    : req.query.shippingAvailable === 'false'
                      ? 0
                      : undefined,
        };

        const result = await ArticleModel.filter(filters);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al filtrar los artículos',
            error: error.message,
        });
    }
}

async function create(req, res) {
    try {
        const article = await ArticleModel.create(req.body, req.user.id);

        return res.status(201).json({
            article,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al crear el anuncio',
            error: error.message,
        });
    }
}

async function getByUserIdAndStatus(req, res) {
    try {
        const { userId } = req.params;
        const { status } = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const capitalizedStatus = status ? status.toUpperCase() : undefined;

        const result = await ArticleModel.getByUserIdAndStatus(
            userId,
            capitalizedStatus,
            page,
            limit,
        );
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar los artículos del usuario',
            error: error.message,
        });
    }
}

async function remove(req, res) {
    try {
        const article = await ArticleModel.getById(req.params.article_id);

        if (!article) {
            return res.status(404).json({
                message: 'Artículo no encontrado',
            });
        }

        const isOwner = article.fk_users_id === req.user.id;

        const isModerator = req.user.rol === 'MODERATOR';

        const isAdmin = req.user.rol === 'ADMINISTRATOR';

        if (!isOwner && !isModerator && !isAdmin) {
            return res.status(403).json({
                message: 'No tienes permisos para eliminar este artículo',
            });
        }

        await ArticleModel.remove(req.params.article_id);

        return res.status(200).json({
            message: 'Artículo eliminado correctamente',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al eliminar el artículo',
            error: error.message,
        });
    }
}

module.exports = {
    getAll,
    getById,
    getByUserIdAndStatus,
    search,
    filter,
    create,
    remove,
};
