const ArticleModel = require('../models/articles.model');
const UserModel = require('../models/user.model');

async function getArticulosPublicados(_req, res) {
    try {
        const total = await ArticleModel.countByStatus('PUBLISHED');
        return res.json({ total });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar artículos publicados',
            error: error.message,
        });
    }
}

async function getArticulosVendidos(_req, res) {
    try {
        const total = await ArticleModel.countByStatus('SOLD');
        return res.json({ total });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar artículos vendidos',
            error: error.message,
        });
    }
}

async function getUsuariosActivos(_req, res) {
    try {
        const total = await UserModel.countActive();
        return res.json({ total });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar usuarios activos',
            error: error.message,
        });
    }
}

module.exports = {
    getArticulosPublicados,
    getArticulosVendidos,
    getUsuariosActivos,
};
