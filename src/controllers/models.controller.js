const Model = require('../models/models.model');

async function getByBrandId(req, res) {
    try {

        const brandId = Number(req.params.brandId);

        const models = await Model.getByBrandId(brandId);

        return res.json(models);

    } catch (error) {

        return res.status(500).json({
            message: 'Error obteniendo modelos',
            error: error.message,
        });

    }
}

module.exports = {
    getByBrandId
};