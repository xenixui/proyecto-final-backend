const db = require('../config/database');
const { withTransaction } = db;

async function getAll(page = 1, limit = 10) {
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const offset = (page - 1) * limit;

    const data = await db.query(
        `SELECT * FROM articles ORDER BY published_at DESC LIMIT ? OFFSET ?`,
        [limit, offset],
    );

    const total = await db.query(`SELECT COUNT(*) as total FROM articles`);

    return {
        page,
        per_page: limit,
        total: total[0].total,
        total_pages: Math.ceil(total[0].total / limit),
        data,
    };
}

async function getById(article_id) {
    const result = await db.query(`SELECT * FROM articles WHERE id = ?`, [
        article_id,
    ]);

    if (result.length === 0) return 0;

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
        [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`],
    );
    return result;
}

async function filter(filters) {
    const conditions = [];
    const params = [];

    // Precio minimo
    if (filters.minPrice !== undefined) {
        conditions.push('a.price >= ?');
        params.push(filters.minPrice);
    }
    // Precio maximo
    if (filters.maxPrice !== undefined) {
        conditions.push('a.price <= ?');
        params.push(filters.maxPrice);
    }
    // Marca
    if (filters.brandId) {
        conditions.push('b.id = ?');
        params.push(filters.brandId);
    }
    // Modelo
    if (filters.modelId) {
        conditions.push('m.id = ?');
        params.push(filters.modelId);
    }
    // Estilo
    if (filters.styleId) {
        conditions.push('a.fk_styles_id = ?');
        params.push(filters.styleId);
    }
    // Genero
    if (filters.gender) {
        conditions.push('m.gender = ?');
        params.push(filters.gender);
    }
    // Tipo de movimiento
    if (filters.movementType) {
        conditions.push('m.movement_type = ?');
        params.push(filters.movementType);
    }
    // Anio de fabricacion
    if (filters.yearOfManufacture) {
        conditions.push('a.year_of_manufacture = ?');
        params.push(filters.yearOfManufacture);
    }
    // Estado de conservacion
    if (filters.condition) {
        conditions.push('a.condition = ?');
        params.push(filters.condition);
    }
    // Caja original
    if (filters.originalBox !== undefined) {
        conditions.push('a.original_box = ?');
        params.push(filters.originalBox);
    }
    // Papeles originales
    if (filters.originalPapers !== undefined) {
        conditions.push('a.original_papers = ?');
        params.push(filters.originalPapers);
    }
    // Envio disponible
    if (filters.shippingAvailable !== undefined) {
        conditions.push('a.shipping_available = ?');
        params.push(filters.shippingAvailable);
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
            a.original_box,
            a.original_papers,
            a.status,
            a.shipping_available,
            a.published_at,
            a.fk_users_id AS seller_id,
            b.id AS brand_id,
            b.name AS brand_name,
            m.id AS model_id,
            m.name AS model_name,
            m.gender,
            m.movement_type,
            s.id AS style_id,
            s.name AS style_name,
            p.city AS seller_city,
            p.country AS seller_country,
            p.postal_code AS seller_postal_code
        FROM articles a
        INNER JOIN models m ON m.id = a.fk_models_id
        INNER JOIN brands b ON b.id = m.fk_brands_id
        INNER JOIN styles s ON s.id = a.fk_styles_id
        LEFT JOIN profiles p ON p.fk_usuarios_id = a.fk_users_id
        ${whereClause}
        ORDER BY a.published_at DESC, a.id DESC
    `;

    return db.query(queryString, params);
}

async function retire(id) {
    await db.query(`UPDATE articles SET status = 'RETIRED' WHERE id = ?`, [id]);
}

async function create(data, userId) {
    return withTransaction(async (connection) => {
        const status = data.publish === false ? 'DRAFT' : 'PUBLISHED';
        const publishedAt = status === 'PUBLISHED' ? new Date() : null;

        const [insertArticleResult] = await connection.execute(
            `INSERT INTO articles
                (title, description, price, ` +
                '`condition`' +
                `, year_of_manufacture,
                 case_material, bracelet_material, original_box, original_papers,
                 status, shipping_available, published_at, fk_users_id, fk_styles_id, fk_models_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.title,
                data.description ?? null,
                data.price,
                data.condition,
                data.year_of_manufacture,
                data.case_material ?? null,
                data.bracelet_material ?? null,
                data.original_box ? 1 : 0,
                data.original_papers ? 1 : 0,
                status,
                data.shipping_available ? 1 : 0,
                publishedAt,
                userId,
                data.fk_styles_id,
                data.fk_models_id,
            ],
        );

        const articleId = insertArticleResult.insertId;

        if (data.images.length > 0) {
            const values = data.images.map((image, i) => {
                const isCover = image.is_cover || i === 0;

                return [image.image_url, isCover ? 1 : 0, articleId];
            });

            await connection.query(
                `INSERT INTO articles_images
                    (image_url, is_cover, fk_articles_id)
                    VALUES ?`,
                [values],
            );
        }

        const [rows] = await connection.execute(
            `SELECT *
             FROM articles
             WHERE id = ?`,
            [articleId],
        );

        return rows[0];
    });
}

async function getByUserIdAndStatus(userId, status, page = 1, limit = 10) {
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const offset = (page - 1) * limit;

    let queryStr = `SELECT * FROM articles WHERE fk_users_id = ?`;
    let countQueryStr = `SELECT COUNT(*) as total FROM articles WHERE fk_users_id = ?`;
    const params = [userId];

    if (status) {
        queryStr += ` AND status = ?`;
        countQueryStr += ` AND status = ?`;
        params.push(status);
    }

    queryStr += ` ORDER BY published_at DESC LIMIT ? OFFSET ?`;

    const data = await db.query(queryStr, [...params, limit, offset]);
    const total = await db.query(countQueryStr, params);

    return {
        page,
        per_page: limit,
        total: total[0].total,
        total_pages: Math.ceil(total[0].total / limit),
        data,
    };
}

async function countByStatus(status) {
    const result = await db.query(
        'SELECT COUNT(*) AS total FROM articles WHERE status = ?',
        [status],
    );

    return result[0].total;
}

async function remove(articleId) {
    return db.query(
        `DELETE FROM articles
         WHERE id = ?`,
        [articleId],
    );
}

async function getByIdAndUserId(articleId, userId) {
    const result = await db.query(
        `SELECT *
         FROM articles
         WHERE id = ?
         AND fk_users_id = ?`,
        [articleId, userId],
    );

    return result[0] || null;
}

async function updateByUserId(articleId, userId, data) {

    const result = await db.query(
        `UPDATE articles
         SET title = ?,
             description = ?,
             price = ?,
             \`condition\` = ?,
             year_of_manufacture = ?,
             case_material = ?,
             bracelet_material = ?,
             original_box = ?,
             original_papers = ?,
             shipping_available = ?,
             fk_styles_id = ?,
             fk_models_id = ?
         WHERE id = ?
         AND fk_users_id = ?`,
        [
            data.title,
            data.description,
            data.price,
            data.condition,
            data.year_of_manufacture,
            data.case_material,
            data.bracelet_material,
            data.original_box ? 1 : 0,
            data.original_papers ? 1 : 0,
            data.shipping_available ? 1 : 0,
            data.fk_styles_id,
            data.fk_models_id,
            articleId,
            userId,
        ]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return getById(articleId);
}

async function markAsSoldByUserId(articleId, userId) {

    const result = await db.query(
        `UPDATE articles
         SET status = 'SOLD'
         WHERE id = ?
         AND fk_users_id = ?
         AND status = 'PUBLISHED'`,
        [
            articleId,
            userId,
        ]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return getById(articleId);
}

module.exports = {
    getAll,
    getById,
    getByUserIdAndStatus,
    search,
    filter,
    retire,
    create,
    countByStatus,
    remove,
    getByIdAndUserId,
    updateByUserId,
    markAsSoldByUserId
}
