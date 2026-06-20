const db = require('../config/database');

async function getAll(page = 1, limit = 10) {
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const offset = (page - 1) * limit;

    const data = await db.query(
        `SELECT * FROM brands ORDER BY name ASC, id ASC LIMIT ? OFFSET ?`,
        [limit, offset],
    );

    const total = await db.query(`SELECT COUNT(*) as total FROM brands`);

    return {
        page,
        per_page: limit,
        total: total[0].total,
        total_pages: Math.ceil(total[0].total / limit),
        data,
    };
}

async function search(term) {
    const result = await db.query(
        `SELECT * FROM brands WHERE name LIKE ? ORDER BY name ASC, id ASC`,
        [`%${term}%`],
    );
    return result;
}

module.exports = {
    getAll,
    search,
};
