const reportsModel = require('../models/reports.model');

async function requireReportUnderReview(req, res, next) {
    try {
        const report = await reportsModel.getById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Reporte no encontrado' });
        }

        if (report.status !== 'UNDER REVIEW') {
            return res.status(409).json({
                message:
                    'Solo se puede editar la nota cuando el reporte está en revisión',
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Error al verificar el reporte',
        });
    }
}

module.exports = {
    requireReportUnderReview,
};
