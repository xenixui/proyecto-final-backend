const styleModel = require('../models/styles.model');

async function getAll(_req, res) {
    try {
        const result = await styleModel.getAll();
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar los estilos',
            error: error.message,
        });
    }
}

async function getById(req, res) {
    try {
        const result = await styleModel.getById(req.params.id);

        if (!result) {
            return res.status(404).json({
                message: 'No existe estilo con este ID',
            });
        }

        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar el estilo',
            error: error.message,
        });
    }
}

async function searchByName(req, res) {
    try {
        const { term } = req.params;
        const result = await styleModel.searchByName(term);

        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al buscar estilos',
            error: error.message,
        });
    }
}

async function create(req, res) {
    try {
        const result = await styleModel.create(req.body);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al crear el estilo',
            error: error.message,
        });
    }
}

async function update(req, res) {
    try {
        const existing = await styleModel.getById(req.params.id);

        if (!existing) {
            return res.status(404).json({
                message: 'No existe estilo con este ID',
            });
        }

        const result = await styleModel.update(req.params.id, req.body);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al actualizar el estilo',
            error: error.message,
        });
    }
}

async function remove(req, res) {
    try {
        const existing = await styleModel.getById(req.params.id);

        if (!existing) {
            return res.status(404).json({
                message: 'No existe estilo con este ID',
            });
        }

        await styleModel.remove(req.params.id);

        return res.json({
            message: 'Estilo eliminado correctamente',
        });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                message:
                    'No se puede eliminar el estilo porque está asociado a uno o más artículos',
            });
        }

        return res.status(500).json({
            message: 'Error al eliminar el estilo',
            error: error.message,
        });
    }
}

module.exports = {
    getAll,
    getById,
    searchByName,
    create,
    update,
    remove,
};
