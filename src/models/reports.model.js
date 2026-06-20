const { query } = require('../config/database');

async function countGestionados() {
    const result = await query(
        "SELECT COUNT(*) AS total FROM reports WHERE status = 'RESOLVED'",
    );

    return result[0].total;
}

async function insertReport(reason, comments, fk_articles_id, fk_users_id) {
    const result = await query(
        `INSERT INTO reports (reason, comments, status, fk_articles_id, fk_users_id) VALUES
    (?, ?, 'PENDING', ?, ?)`,
        [reason, comments, fk_articles_id, fk_users_id],
    );
    return result;
}

module.exports = {
    insertReport,
    countGestionados,
};
