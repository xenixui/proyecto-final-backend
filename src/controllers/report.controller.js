const reportService = require('../services/report.service');
const reportModel = require('../models/reports.model');

async function createReport(req, res) {
    try {
        const { reason, comments, fk_articles_id } = req.body
        const { id: fk_users_id } = req.user

        const nuevoReporte = await reportService.createReport({
            reason,
            comments, 
            fk_articles_id, 
            fk_users_id
        })

        if (!nuevoReporte) {
            return res.status(404).json({
                message: 'Error al procesar la solicitud de reporte'
            });
        }
        res.status(201).json(nuevoReporte)

    } catch (error) {
        console.error('error:', error)
        res.status(500).json({
            message: 'Error al crear el reporte'
        })
    }
}

async function getReportsByStatus(req, res) {
    try {
        const { status, page, limit } = req.validatedQuery;
        const result = await reportModel.getByStatus(
            status,
            page || 1,
            limit || 10,
        );
        return res.json(result);
    } catch (err) {
        console.error('error:', err);
        return res.status(500).json({
            message: 'Error al obtener los reportes',
            error: err.message,
        });
    }
}

async function getReportById(req, res) {
    try {
        const { id } = req.params;
        const report = await reportModel.getById(id);

        if (!report) {
            return res.status(404).json({
                message: 'Reporte no encontrado',
            });
        }

        return res.json(report);
    } catch (err) {
        console.error('error:', err);
        return res.status(500).json({
            message: 'Error al obtener el reporte',
            error: err.message,
        });
    }
}

module.exports = {
    createReport,
    getReportsByStatus,
    getReportById,
};