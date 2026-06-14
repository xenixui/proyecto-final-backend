const db = require('../config/database');

async function getAll(page = 1, limit = 10) {
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;
    
    const data = await db.query(
        `SELECT * FROM articles ORDER BY published_at DESC LIMIT ${limit} OFFSET ${offset}`
    );

    const total = await db.query(`SELECT COUNT(*) as total FROM articles`);

    return {
        page,
        per_page: limit,
        total: total[0].total,
        total_pages: Math.ceil(total[0].total / limit),
        data
    };
}

async function search(term) {
    const result = await db.query(
    `SELECT * 
        FROM articles
        INNER JOIN models ON articles.fk_models_id = models.id
        INNER JOIN brands ON models.fk_brands_id = brands.id
        WHERE brands.name LIKE ?
        AND models.name LIKE ?
        AND models.reference LIKE ?
        AND articles.description LIKE ?
        ORDER BY articles.published_at DESC`,
    [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]
    );
    return result;
}

module.exports = {
    getAll,
    search
}