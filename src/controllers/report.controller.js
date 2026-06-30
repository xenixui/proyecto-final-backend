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
        const { status } = req.validatedQuery;
        const reports = await reportModel.getByStatus(status);
        return res.json(reports);
    } catch (err) {
        console.error('error:', err);
        return res.status(500).json({
            message: 'Error al obtener los reportes',
            error: err.message,
        });
    }
}

module.exports = {
    createReport,
    getReportsByStatus,
};