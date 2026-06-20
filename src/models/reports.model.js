const db = require('../config/database')

async function insertReport (reason, comments, fk_articles_id, fk_users_id) {
    const result = await db.query(
        `INSERT INTO reports (reason, comments, status, fk_articles_id, fk_users_id) VALUES
    (?, ?, 'PENDING', ?, ?)`,
    [reason, comments, fk_articles_id, fk_users_id]
    );
    return result;
}

module.exports = {
    insertReport
}