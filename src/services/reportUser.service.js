// src/services/report.service.js
// Lógica de negocio para reportar usuarios

const { query } = require('../config/database');

// ─── Reportar un usuario ──────────────────────────────────────
// Requiere la columna fk_reported_user_id en reports (ver migración SQL)
async function reportUser(reporterId, reportedUserId, reason) {
    // No puedes reportarte a ti mismo
    if (Number(reportedUserId) === reporterId) {
        throw { status: 400, message: 'No puedes reportarte a ti mismo' };
    }

    // El usuario reportado debe existir y estar activo
    const [reportedUser] = await query(
        "SELECT id FROM users WHERE id = ? AND status = 'ACTIVE'",
        [reportedUserId],
    );
    if (!reportedUser) {
        throw { status: 404, message: 'Usuario no encontrado' };
    }

    // Evita reportes duplicados mientras el anterior siga activo
    const [existing] = await query(
        `SELECT id FROM reports
         WHERE fk_reported_user_id = ? AND fk_users_id = ? AND status != 'RESOLVED'`,
        [reportedUserId, reporterId],
    );
    if (existing) {
        throw { status: 409, message: 'Ya has reportado a este usuario anteriormente' };
    }

    await query(
        `INSERT INTO reports (reason, status, created_at, fk_reported_user_id, fk_users_id)
         VALUES (?, 'PENDING', NOW(), ?, ?)`,
        [reason.trim(), reportedUserId, reporterId],
    );

    return { message: 'Usuario reportado correctamente. Lo revisaremos pronto.' };
}

// ─── Mis reportes de usuarios enviados ────────────────────────
async function getMyUserReports(reporterId) {
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
    reportUser,
    getMyUserReports,
};
