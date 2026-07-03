const ArticleModel = require('../models/articles.model');
const UserModel = require('../models/user.model');
const ReportsModel = require('../models/reports.model');

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

async function getReportesGestionados(_req, res) {
    try {
        const total = await ReportsModel.countGestionados();
        return res.json({ total });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar reportes gestionados',
            error: error.message,
        });
    }
}

async function getReportesPorEstado(req, res) {
    try {
        const { periodo } = req.query;
        const result = await ReportsModel.countByStatus(periodo);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar reportes por estado',
            error: error.message,
        });
    }
}

async function getUsuariosPorEstado(req, res) {
    try {
        const { periodo } = req.query;
        const result = await UserModel.countByStatus(periodo);
        return res.json(result);
    } catch (error) {           
        return res.status(500).json({                   
        message: 'Error al recuperar usuarios por estado',
            error: error.message,
        });
    }
}

async function getUsuariosPorFecha(req, res) {
    try {
        const { periodo } = req.query; 
        const result = await UserModel.getSessionByDate(periodo);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar usuarios por fecha',   
            error: error.message,
        });
    }       
}

async function getArticulosPorFecha(req, res) {
    try {
        const { periodo } = req.query;
        const result = await ArticleModel.getArticlesByDate(periodo);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar artículos por fecha',  
            error: error.message,
        });
    }   
}

module.exports = {
    getArticulosPublicados,
    getArticulosVendidos,
    getUsuariosActivos,
    getReportesGestionados,
    getReportesPorEstado,
    getUsuariosPorEstado,
    getUsuariosPorFecha,
    getArticulosPorFecha,
};
