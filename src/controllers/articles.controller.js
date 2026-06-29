const ArticleModel = require('../models/articles.model');
const cloudinaryService = require('../services/cloudinary.service');

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
        const isStaff =
            req.user.rol === 'ADMINISTRATOR' || req.user.rol === 'MODERATOR';

        if (!isStaff) {
            const article = await ArticleModel.getByIdAndUserId(
                req.params.article_id,
                req.user.id,
            );

            if (!article) {
                return res.status(403).json({
                    message: 'Acceso denegado',
                });
            }
        }

        await ArticleModel.remove(req.params.article_id);

        return res.sendStatus(200);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al eliminar el artículo',
            error: error.message,
        });
    }
}

async function update(req, res) {
    try {
        const article = await ArticleModel.updateByUserId(
            req.params.article_id,
            req.user.id,
            req.body,
        );

        if (!article) {
            return res.status(403).json({
                message: 'Acceso denegado',
            });
        }

        return res.status(200).json({
            article,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al actualizar el artículo',
            error: error.message,
        });
    }
}

async function markAsSold(req, res) {
    try {
        const article = await ArticleModel.markAsSoldByUserId(
            req.params.article_id,
            req.user.id,
        );

        if (!article) {
            return res.status(404).json({
                message: 'Artículo no encontrado o no disponible',
            });
        }

        return res.status(200).json({
            article,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al marcar el artículo como vendido',
            error: error.message,
        });
    }
}

async function removeArticleImages(req, res, imageIds) {
    try {
        const articleId = req.params.article_id;
        const uniqueIds = [...new Set(imageIds)];

        const article = await ArticleModel.getByIdAndUserId(
            articleId,
            req.user.id,
        );

        if (!article) {
            return res.status(403).json({
                message: 'Acceso denegado',
            });
        }

        const images = await ArticleModel.getImagesByIds(articleId, uniqueIds);

        if (images.length !== uniqueIds.length) {
            return res.status(404).json({
                message: 'Una o más imágenes no fueron encontradas',
            });
        }

        await Promise.all(
            images.map((image) =>
                cloudinaryService.deleteImage(image.image_url),
            ),
        );
        await ArticleModel.removeImages(articleId, uniqueIds, images);

        return res.status(200).json({
            message: 'Imágenes eliminadas correctamente',
            deleted_count: uniqueIds.length,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al eliminar las imágenes',
            error: error.message,
        });
    }
}

async function deleteImages(req, res) {
    return removeArticleImages(req, res, req.body.image_ids);
}

async function uploadImages(req, res) {
    try {
        const articleId = req.params.article_id;

        if (!req.files?.length) {
            return res.status(400).json({
                message: 'Debes enviar al menos una imagen',
            });
        }

        const article = await ArticleModel.getByIdAndUserId(
            articleId,
            req.user.id,
        );

        if (!article) {
            return res.status(403).json({
                message: 'Acceso denegado',
            });
        }

        const hasCover = await ArticleModel.hasCoverImage(articleId);

        const uploadResults = await Promise.all(
            req.files.map((file) =>
                cloudinaryService.uploadImage(
                    file.buffer,
                    `articles/${articleId}`,
                ),
            ),
        );

        const images = uploadResults.map((result, index) => ({
            image_url: result.secure_url,
            is_cover: !hasCover && index === 0,
        }));

        const savedImages = await ArticleModel.addImages(articleId, images);

        return res.status(201).json({ images: savedImages });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al subir las imágenes',
            error: error.message,
        });
    }
}

async function getSimilar(req, res) {
    try {
        const limit = Number(req.query.limit) || 3;
        const result = await ArticleModel.getSimilar(req.params.article_id, limit);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar artículos similares',
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
    update,
    markAsSold,
    uploadImages,
    deleteImages,
    getSimilar,
};
