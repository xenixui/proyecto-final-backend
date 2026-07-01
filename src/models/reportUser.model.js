// src/models/reportUser.model.js
// Funciones de acceso a BD para reportes de usuarios

const { query } = require('../config/database');

// Insertar reporte de usuario
async function insertUserReport(reporterId, reportedUserId, reason, comments) {
    const result = await query(
        `INSERT INTO reports (reason, comments, status, created_at, fk_reported_user_id, fk_users_id)
         VALUES (?, ?, 'PENDING', NOW(), ?, ?)`,
        [reason, comments ? comments.trim() : null, reportedUserId, reporterId],
    );
    return result;
}

// Buscar reporte duplicado activo (para validar)
async function getUserReportByIds(reporterId, reportedUserId) {
    const [result] = await query(
        `SELECT id FROM reports
         WHERE fk_reported_user_id = ? AND fk_users_id = ? AND status != 'RESOLVED'`,
        [reportedUserId, reporterId],
    );
    return result || null;
}

// Obtener usuario por ID y validar que esté activo
async function getUserById(userId) {
    const [result] = await query(
        `SELECT id FROM users WHERE id = ? AND status = 'ACTIVE'`,
        [userId],
    );
    return result || null;
}

// Obtener histórico de reportes de usuario por reportador
async function getUserReportsByReporter(reporterId) {
    return await query(
        `SELECT
           r.id,
           r.reason,
           r.status,
           r.created_at,
           r.resolution,
           r.resolved_at,
           ru.id       AS reported_user_id,
           p.username  AS reported_username
         FROM reports r
         JOIN users ru   ON ru.id = r.fk_reported_user_id
         JOIN profiles p ON p.fk_usuarios_id = ru.id
         WHERE r.fk_users_id = ?
           AND r.fk_reported_user_id IS NOT NULL
         ORDER BY r.created_at DESC`,
        [reporterId],
    );
}

module.exports = {
    insertUserReport,
    getUserReportByIds,
    getUserById,
    getUserReportsByReporter,
};
