const db = require('../config/database');

async function getAll() {
    const result = await db.query(`SELECT * FROM articles ORDER BY published_at DESC`);
    return result;
}

async function search(term) {
    const result = await db.query(
    `SELECT * 
        FROM articles
        INNER JOIN models ON articles.fk_models_id = models.id
        INNER JOIN brands ON models.fk_brands_id = brands.id
        WHERE brands.name LIKE ?
        OR models.name LIKE ?
        OR models.reference LIKE ?
        OR articles.description LIKE ?
        ORDER BY articles.published_at DESC`,
    [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]
    );
    return result;
}

module.exports = {
    getAll,
    search
}