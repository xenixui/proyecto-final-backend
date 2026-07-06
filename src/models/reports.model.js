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
         WHERE r.status = 'RESOLVED'
         ORDER BY r.resolved_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset],
    );

    const total = await db.query(
        `SELECT COUNT(*) AS total FROM reports WHERE status = 'RESOLVED'`,
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
                r.fk_reported_user_id AS reported_user_id,
                r.fk_users_id AS reporter_id,
                r.fk_moderator_id AS moderator_id,
                a.title AS article_title,
                a.status AS article_status,
                a.fk_users_id AS seller_id,
                u.email AS reporter_email
         FROM reports r
         LEFT JOIN articles a ON a.id = r.fk_articles_id
         INNER JOIN users u ON u.id = r.fk_users_id
         WHERE r.id = ?`,
        [id],
    );

    return result[0] || null;
}

async function closeReport(
    id,
    { moderatorId, resolution, moderatorNote },
    connection,
) {
    const now = new Date();
    const sql = `UPDATE reports
         SET status = 'RESOLVED',
             resolved_at = ?,
             fk_moderator_id = ?,
             resolution = ?,
             moderator_note = ?
         WHERE id = ?`;
    const params = [now, moderatorId, resolution, moderatorNote || null, id];

    if (connection) {
        await connection.execute(sql, params);
    } else {
        await db.query(sql, params);
    }
}

async function updateModeratorNote(id, { moderatorId, moderatorNote }) {
    await db.query(
        `UPDATE reports
         SET moderator_note = ?,
             fk_moderator_id = ?
         WHERE id = ?`,
        [moderatorNote, moderatorId, id],
    );
}

async function markUnderReview(id, { moderatorId }, connection) {
    const sql = `UPDATE reports
         SET status = 'UNDER REVIEW',
             fk_moderator_id = ?
         WHERE id = ?`;

    if (connection) {
        await connection.execute(sql, [moderatorId, id]);
    } else {
        await db.query(sql, [moderatorId, id]);
    }
}

async function countGestionados() {
    const result = await db.query(
        "SELECT COUNT(*) AS total FROM reports WHERE status = 'RESOLVED'",
    );

    return result[0].total;
}

async function insertReport(reason, comments, fk_articles_id, fk_users_id) {
    const result = await db.query(
        `INSERT INTO reports (reason, comments, status, fk_articles_id, fk_users_id) VALUES
    (?, ?, 'PENDING', ?, ?)`,
        [reason, comments, fk_articles_id, fk_users_id],
    );
    return result;
}

async function getArticleForReport(articleId) {
    const result = await db.query(
        `SELECT id, fk_users_id
         FROM articles
         WHERE id = ?`,
        [articleId],
    );

    return result[0] || null;
}

async function getByStatus(filters = {}) {
    const {
        status,
        reason,
        byreportype,
        search,
        created_from,
        created_to,
        page = 1,
        limit = 10,
    } = filters;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const joins = `
         INNER JOIN users u ON u.id = r.fk_users_id
         LEFT JOIN profiles p ON p.fk_usuarios_id = u.id
         LEFT JOIN articles a ON a.id = r.fk_articles_id`;

    let queryStr = `SELECT
            r.id,
            r.reason,
            r.comments,
            r.status,
            r.created_at,
            r.resolved_at,
            r.fk_articles_id AS article_id,
            r.fk_reported_user_id AS reported_user_id,
            p.name,
            p.surname,
            u.email
         FROM reports r${joins}
         WHERE 1 = 1`;
    let countQueryStr = `SELECT COUNT(*) AS total
         FROM reports r${joins}
         WHERE 1 = 1`;
    const params = [];

    if (status) {
        queryStr += ' AND r.status = ?';
        countQueryStr += ' AND r.status = ?';
        params.push(status);
    }

    if (reason) {
        queryStr += ' AND r.reason = ?';
        countQueryStr += ' AND r.reason = ?';
        params.push(reason);
    }

    if (byreportype === 'articulo') {
        queryStr += ' AND r.fk_reported_user_id IS NULL';
        countQueryStr += ' AND r.fk_reported_user_id IS NULL';
    }

    if (byreportype === 'usuario') {
        queryStr += ' AND r.fk_reported_user_id IS NOT NULL';
        countQueryStr += ' AND r.fk_reported_user_id IS NOT NULL';
    }

    if (created_from) {
        queryStr += ' AND r.created_at >= ?';
        countQueryStr += ' AND r.created_at >= ?';
        params.push(created_from);
    }

    if (created_to) {
        queryStr += ' AND r.created_at <= ?';
        countQueryStr += ' AND r.created_at <= ?';
        params.push(created_to);
    }

    if (search) {
        const searchPattern = `%${search.toLowerCase()}%`;
        const searchClause = ` AND (
            CAST(r.id AS CHAR) LIKE ?
            OR CAST(r.fk_articles_id AS CHAR) LIKE ?
            OR LOWER(a.title) LIKE ?
            OR LOWER(u.email) LIKE ?
            OR LOWER(IFNULL(p.name, '')) LIKE ?
            OR LOWER(IFNULL(p.surname, '')) LIKE ?
            OR LOWER(r.comments) LIKE ?
        )`;
        queryStr += searchClause;
        countQueryStr += searchClause;
        params.push(
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
        );
    }

    queryStr += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';

    const data = await db.query(queryStr, [...params, parsedLimit, offset]);
    const total = await db.query(countQueryStr, params);

    return {
        page: parsedPage,
        per_page: parsedLimit,
        total: total[0].total,
        total_pages: Math.ceil(total[0].total / parsedLimit),
        data,
    };
}
async function countByStatus(periodo) {
    let whereClause = '';

    if (periodo === '7d') {
        whereClause = `WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
    } else if (periodo === '30d') {
        whereClause = `WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
    } else if (periodo === 'today') {
        whereClause = `WHERE DATE(created_at) = CURDATE()`;
    }

    const result = await db.query(
        `SELECT status, COUNT(*) AS total 
        FROM reports  
        ${whereClause}
        GROUP BY status`,
    );
    return result;
}

module.exports = {
    getAll,
    getHistory,
    getById,
    getByStatus,
    closeReport,
    updateModeratorNote,
    markUnderReview,
    insertReport,
    getArticleForReport,
    countGestionados,
    countByStatus,
};
