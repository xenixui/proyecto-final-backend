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

async function getById(article_id) {
    const result = await db.query(
        `SELECT * FROM articles WHERE id = ?`,
        [article_id]);

    if (result.length===0) return 0;

    return result[0];
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

async function filter(filters) {
    const conditions = [];
    const params = [];

    if (filters.status) {
        conditions.push('a.status = ?');
        params.push(filters.status);
    }
    if (filters.styleId) {
        conditions.push('a.fk_styles_id = ?');
        params.push(filters.styleId); 
    }
    if (filters.minPrice !== undefined) {
        conditions.push('a.price >= ?');
        params.push(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
        conditions.push('a.price <= ?');
        params.push(filters.maxPrice);
    }
    if (filters.city) {
        conditions.push('p.city = ?');
        params.push(filters.city);
    }
    if (filters.country) {
        conditions.push('p.country = ?');
        params.push(filters.country);
    }
    if (filters.postalCode) {
        conditions.push('p.postal_code = ?');
        params.push(filters.postalCode);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const queryString = `
        SELECT
            a.id,
            a.title,
            a.description,
            a.price,
            a.condition,
            a.year_of_manufacture,
            a.case_material,
            a.bracelet_material,
            a.original_box,
            a.original_papers,
            a.status,
            a.shipping_available,
            a.published_at,
            a.fk_users_id AS seller_id,
            s.id AS style_id,
            s.name AS style_name,
            p.city AS seller_city,
            p.country AS seller_country,
            p.postal_code AS seller_postal_code
        FROM articles a
        INNER JOIN styles s ON s.id = a.fk_styles_id
        LEFT JOIN profiles p ON p.fk_usuarios_id = a.fk_users_id
        ${whereClause}
        ORDER BY a.published_at DESC, a.id DESC
    `;

    return db.query(queryString, params);
}



module.exports = {
    getAll,
    getById,
    search,
    filter
}