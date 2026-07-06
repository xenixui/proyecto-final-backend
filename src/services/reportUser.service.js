// src/services/reportUser.service.js
// Lógica de negocio para reportar usuarios

const reportUserModel = require('../models/reportUser.model');

// Reportar un usuario
async function reportUser(reporterId, reportedUserId, reason, comments) {
    // No puedes reportarte a ti mismo
    if (Number(reportedUserId) === reporterId) {
        throw { status: 400, message: 'No puedes reportarte a ti mismo' };
    }

    // El usuario reportado debe existir y estar activo
    const reportedUser = await reportUserModel.getUserById(reportedUserId);
    if (!reportedUser) {
        throw { status: 404, message: 'Usuario no encontrado' };
    }

    // Evita reportes duplicados mientras el anterior siga activo
    const existing = await reportUserModel.getUserReportByIds(reporterId, reportedUserId);
    if (existing) {
        throw { status: 409, message: 'Ya has reportado a este usuario anteriormente' };
    }

    await reportUserModel.insertUserReport(reporterId, reportedUserId, reason, comments);

    return { message: 'Usuario reportado correctamente. Lo revisaremos pronto.' };
}

// Obtener mis reportes de usuarios enviados
async function getMyUserReports(reporterId) {
    return await reportUserModel.getUserReportsByReporter(reporterId);
}

module.exports = {
    reportUser,
    getMyUserReports,
};
