const { query } = require('../config/database');

async function searchArticles(filters) {
    const conditions = [];
    const params = [];

    if (filters.status) {
        conditions.push('a.status = ?');
        params.push(filters.status);
    }

    if (filters.styleId) {
        conditions.push('a.fk_styles_id = ?');
        params.push(filters.categoryId);
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

    const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

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

    return query(queryString, params);
}

module.exports = {
    searchArticles,
};
