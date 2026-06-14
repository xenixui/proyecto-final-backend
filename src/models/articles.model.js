const db = require('../config/database');

async function getAll() {
    const result = await db.query('SELECT * FROM articles ORDER BY published_at DESC');
    return result;
}

module.exports = {
    getAll
}