const db = require('../config/database');

async function getAll(page = 1, limit = 10) {
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (page - 1) * limit;

    const data = await db.query(
        `SELECT r.id, r.reason, r.comments, r.status, r.created_at, r.resolved_at,
                r.resolution, r.moderator_note,
                r.fk_articles_id AS article_id,
                r.fk_users_id AS reporter_id,
                r.fk_moderator_id AS moderator_id,
                a.title AS article_title,
                a.fk_users_id AS seller_id,
                u.email AS reporter_email
         FROM reports r
         INNER JOIN articles a ON a.id = r.fk_articles_id
         INNER JOIN users u ON u.id = r.fk_users_id
         ORDER BY r.created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset],
    );

    const total = await db.query(`SELECT COUNT(*) AS total FROM reports`);

    return {
        page,
        per_page: limit,
        total: total[0].total,
        total_pages: Math.ceil(total[0].total / limit),
        data,
    };
}

async function getHistory(page = 1, limit = 10) {
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (page - 1) * limit;

    const data = await db.query(
        `SELECT r.id, r.reason, r.comments, r.status, r.created_at, r.resolved_at,
                r.resolution, r.moderator_note,
                r.fk_articles_id AS article_id,
                r.fk_users_id AS reporter_id,
                r.fk_moderator_id AS moderator_id,
                a.title AS article_title,
                a.fk_users_id AS seller_id,
                u.email AS reporter_email
         FROM reports r
         INNER JOIN articles a ON a.id = r.fk_articles_id
         INNER JOIN users u ON u.id = r.fk_users_id
         WHERE r.status IN ('RESOLVED', 'REJECTED')
         ORDER BY r.resolved_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset],
    );

    const total = await db.query(
        `SELECT COUNT(*) AS total FROM reports WHERE status IN ('RESOLVED', 'REJECTED')`,
    );

    return {
        page,
        per_page: limit,
        total: total[0].total,
        total_pages: Math.ceil(total[0].total / limit),
        data,
    };
}

async function getById(id) {
    const result = await db.query(
        `SELECT r.id, r.reason, r.comments, r.status, r.created_at, r.resolved_at,
                r.resolution, r.moderator_note,
                r.fk_articles_id AS article_id,
                r.fk_users_id AS reporter_id,
                r.fk_moderator_id AS moderator_id,
                a.title AS article_title,
                a.status AS article_status,
                a.fk_users_id AS seller_id,
                u.email AS reporter_email
         FROM reports r
         INNER JOIN articles a ON a.id = r.fk_articles_id
         INNER JOIN users u ON u.id = r.fk_users_id
         WHERE r.id = ?`,
        [id],
    );

    return result[0] || null;
}

async function resolve(id, { moderatorId, resolution, moderatorNote }) {
    const now = new Date();
    await db.query(
        `UPDATE reports
         SET status = 'RESOLVED',
             resolved_at = ?,
             fk_moderator_id = ?,
             resolution = ?,
             moderator_note = ?
         WHERE id = ?`,
        [now, moderatorId, resolution, moderatorNote || null, id],
    );
}

async function reject(id, { moderatorId, moderatorNote }) {
    const now = new Date();
    await db.query(
        `UPDATE reports
         SET status = 'REJECTED',
             resolved_at = ?,
             fk_moderator_id = ?,
             resolution = NULL,
             moderator_note = ?
         WHERE id = ?`,
        [now, moderatorId, moderatorNote || null, id],
    );
}

module.exports = { getAll, getHistory, getById, resolve, reject };
