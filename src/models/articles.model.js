const db = require('../config/database');
const {
    withTransaction
} = db;

async function getAll(page = 1, limit = 10) {

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    const offset = (page - 1) * limit;

    const data = await db.query(
        `
        SELECT
            a.id,
            a.title,
            a.description,
            a.price,
            a.condition,
            a.year_of_manufacture,
            a.original_box,
            a.original_papers,
            a.shipping_available,
            a.status,
            a.published_at,

            b.id   AS brand_id,
            b.name AS brand_name,

            m.id   AS model_id,
            m.name AS model_name,
            m.reference,
            m.gender,
            m.movement_type,

            s.id   AS style_id,
            s.name AS style_name,

            p.city,
            p.country,

            ai.image_url AS cover

        FROM articles a

        INNER JOIN models m
            ON m.id = a.fk_models_id

        INNER JOIN brands b
            ON b.id = m.fk_brands_id

        INNER JOIN styles s
            ON s.id = a.fk_styles_id

        LEFT JOIN profiles p
            ON p.fk_usuarios_id = a.fk_users_id

        LEFT JOIN articles_images ai
            ON ai.fk_articles_id = a.id
           AND ai.is_cover = 1

        WHERE a.status='PUBLISHED'

        ORDER BY a.published_at DESC

        LIMIT ?
        OFFSET ?
        `,
        [limit, offset]
    );

    const total = await db.query(
        `
        SELECT COUNT(*) total
        FROM articles
        WHERE status='PUBLISHED'
        `
    );

    return {

        page,

        per_page: limit,

        total: total[0].total,

        total_pages: Math.ceil(total[0].total / limit),

        data

    };

}

async function mapArticle(article) {
    const images = await db.query(
        `SELECT id, image_url, is_cover
         FROM articles_images
         WHERE fk_articles_id = ?
         ORDER BY is_cover DESC, id ASC`,
        [article.id],
    );

    return {
        ...article,
        images,
    };
}

async function getById(articleId, currentUserId) {
    const rows = await db.query(
        `
        SELECT
            a.*,
            b.id   AS brand_id,
            b.name AS brand_name,
            m.id AS model_id,
            m.name AS model_name,
            m.reference,
            m.gender,
            m.movement_type,
            s.id AS style_id,
            s.name AS style_name,
            p.city,
            p.country,
            u.id AS seller_user_id,
            p.username AS seller_username,
            p.name AS seller_name,
            p.surname AS seller_surname,
            p.photo_url AS seller_photo_url,
            p.rating AS seller_rating,
            p.created_at AS seller_created_at
        FROM articles a
        INNER JOIN models m ON m.id = a.fk_models_id
        INNER JOIN brands b ON b.id = m.fk_brands_id
        INNER JOIN styles s ON s.id = a.fk_styles_id
        INNER JOIN users u ON u.id = a.fk_users_id
        LEFT JOIN profiles p ON p.fk_usuarios_id = a.fk_users_id
        WHERE a.id = ?
        `,
        [articleId],
    );

    if (!rows.length) {
        return null;
    }

    const article = rows[0];

    const images = await db.query(
        `
        SELECT id, image_url, is_cover
        FROM articles_images
        WHERE fk_articles_id = ?
        ORDER BY is_cover DESC, id ASC
        `,
        [articleId],
    );

    const [{ sales_count }] = await db.query(
        `SELECT COUNT(*) AS sales_count FROM articles WHERE fk_users_id = ? AND status = 'SOLD'`,
        [article.fk_users_id],
    );

    let is_favorite = false;
    if (currentUserId) {
        const fav = await db.query(
            `SELECT id FROM favorite WHERE fk_users_id = ? AND fk_articles_id = ?`,
            [currentUserId, articleId],
        );
        is_favorite = fav.length > 0;
    }

    return {
        id: article.id,
        title: article.title,
        description: article.description,
        price: article.price,
        condition: article.condition,
        year_of_manufacture: article.year_of_manufacture,
        case_material: article.case_material,
        bracelet_material: article.bracelet_material,
        original_box: !!article.original_box,
        original_papers: !!article.original_papers,
        shipping_available: !!article.shipping_available,
        status: article.status,
        published_at: article.published_at,
        city: article.city,
        country: article.country,
        fk_users_id: article.fk_users_id,
        fk_styles_id: article.fk_styles_id,
        fk_models_id: article.fk_models_id,
        brand: {
            id: article.brand_id,
            name: article.brand_name,
        },
        model: {
            id: article.model_id,
            name: article.model_name,
            reference: article.reference,
            movement_type: article.movement_type,
            gender: article.gender,
        },
        style: {
            id: article.style_id,
            name: article.style_name,
        },
        images,
        is_favorite,
        seller: {
            id: article.seller_user_id,
            username: article.seller_username,
            name: article.seller_name,
            surname: article.seller_surname,
            photo_url: article.seller_photo_url,
            rating: article.seller_rating,
            sales_count,
            purchases_count: 0,
            member_since: article.seller_created_at
                ? new Date(article.seller_created_at).getFullYear()
                : null,
        },
    };
}

async function search(term) {
    return await db.query(
        `
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
            a.shipping_available,
            a.status,
            a.published_at,

            b.id   AS brand_id,
            b.name AS brand_name,

            m.id   AS model_id,
            m.name AS model_name,
            m.reference,
            m.gender,
            m.movement_type,

            s.id   AS style_id,
            s.name AS style_name,

            p.city,
            p.country,

            ai.image_url AS cover

        FROM articles a

        INNER JOIN models m
            ON a.fk_models_id = m.id

        INNER JOIN brands b
            ON m.fk_brands_id = b.id

        INNER JOIN styles s
            ON a.fk_styles_id = s.id

        LEFT JOIN profiles p
            ON p.fk_usuarios_id = a.fk_users_id

        LEFT JOIN articles_images ai
            ON ai.fk_articles_id = a.id
            AND ai.is_cover = 1

        WHERE
            a.status = 'PUBLISHED'
            AND (
                b.name LIKE ?
                OR m.name LIKE ?
                OR m.reference LIKE ?
                OR a.title LIKE ?
                OR a.description LIKE ?
            )

        ORDER BY a.published_at DESC
        `,
        [
            `%${term}%`,
            `%${term}%`,
            `%${term}%`,
            `%${term}%`,
            `%${term}%`
        ]
    );
}

async function filter(filters) {

    const conditions = [`a.status = 'PUBLISHED'`];
    const params = [];

    if (filters.minPrice !== undefined) {
        conditions.push('a.price >= ?');
        params.push(filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
        conditions.push('a.price <= ?');
        params.push(filters.maxPrice);
    }

    if (filters.brandId) {
        conditions.push('b.id = ?');
        params.push(filters.brandId);
    }

    // Soporta selección múltiple de modelos (modelIds="1,2,3"),
    // manteniendo compatibilidad con el filtro antiguo de un único modelId.
    if (filters.modelIds) {

        const modelIds = String(filters.modelIds)
            .split(',')
            .map((id) => id.trim())
            .filter((id) => id.length > 0);

        if (modelIds.length) {
            const placeholders = modelIds.map(() => '?').join(', ');
            conditions.push(`m.id IN (${placeholders})`);
            params.push(...modelIds);
        }

    } else if (filters.modelId) {
        conditions.push('m.id = ?');
        params.push(filters.modelId);
    }

    if (filters.styleId) {
        conditions.push('s.id = ?');
        params.push(filters.styleId);
    }

    if (filters.gender) {
        const genders = String(filters.gender)
            .split(',')
            .map((g) => g.trim())
            .filter((g) => g.length > 0);

        if (genders.length) {
            const placeholders = genders.map(() => '?').join(', ');
            conditions.push(`m.gender IN (${placeholders})`);
            params.push(...genders);
        }
    }

    if (filters.movementType) {
        const movements = String(filters.movementType)
            .split(',')
            .map((m) => m.trim())
            .filter((m) => m.length > 0);

        if (movements.length) {
            const placeholders = movements.map(() => '?').join(', ');
            conditions.push(`m.movement_type IN (${placeholders})`);
            params.push(...movements);
        }
    }

    if (filters.yearOfManufacture) {
        conditions.push('a.year_of_manufacture = ?');
        params.push(filters.yearOfManufacture);
    }

    if (filters.condition) {
        const conditionsList = String(filters.condition)
            .split(',')
            .map((c) => c.trim())
            .filter((c) => c.length > 0);

        if (conditionsList.length) {
            const placeholders = conditionsList.map(() => '?').join(', ');
            conditions.push(`a.condition IN (${placeholders})`);
            params.push(...conditionsList);
        }
    }

    if (filters.originalBox !== undefined) {
        conditions.push('a.original_box = ?');
        params.push(filters.originalBox);
    }

    if (filters.originalPapers !== undefined) {
        conditions.push('a.original_papers = ?');
        params.push(filters.originalPapers);
    }

    if (filters.shippingAvailable !== undefined) {
        conditions.push('a.shipping_available = ?');
        params.push(filters.shippingAvailable);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    return await db.query(
        `
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
            a.shipping_available,
            a.status,
            a.published_at,

            b.id   AS brand_id,
            b.name AS brand_name,

            m.id   AS model_id,
            m.name AS model_name,
            m.reference,
            m.gender,
            m.movement_type,

            s.id   AS style_id,
            s.name AS style_name,

            p.city,
            p.country,

            ai.image_url AS cover

        FROM articles a

        INNER JOIN models m
            ON a.fk_models_id = m.id

        INNER JOIN brands b
            ON m.fk_brands_id = b.id

        INNER JOIN styles s
            ON a.fk_styles_id = s.id

        LEFT JOIN profiles p
            ON p.fk_usuarios_id = a.fk_users_id

        LEFT JOIN articles_images ai
            ON ai.fk_articles_id = a.id
            AND ai.is_cover = 1

        ${whereClause}

        ORDER BY a.published_at DESC, a.id DESC
        `,
        params
    );

}

async function retire(id, connection) {
    const sql = `UPDATE articles SET status = 'RETIRED' WHERE id = ?`;

    if (connection) {
        await connection.execute(sql, [id]);
    } else {
        await db.query(sql, [id]);
    }
}

async function create(data, userId) {
    return withTransaction(async (connection) => {

        const status = data.publish === false ? 'DRAFT' : 'PUBLISHED';
        const publishedAt = status === 'PUBLISHED' ? new Date() : null;

        const [insertArticleResult] = await connection.execute(
            `INSERT INTO articles
                (title, description, price, \`condition\`,
                 year_of_manufacture,
                 case_material, bracelet_material,
                 original_box, original_papers,
                 status, shipping_available,
                 published_at, fk_users_id,
                 fk_styles_id, fk_models_id)
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
    return withTransaction(async (connection) => {

        const [result] = await connection.execute(
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

        await connection.commit();
        return await getById(articleId);
    });
}

async function transitionStatusByUserId(articleId, userId, nextStatus, currentStatus) {
    const result = await db.query(
        `UPDATE articles
         SET status = ?
         WHERE id = ?
         AND fk_users_id = ?
         AND status = ?`,
        [nextStatus, articleId, userId, currentStatus]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return getById(articleId);
}

function markAsReservedByUserId(articleId, userId) {
    return transitionStatusByUserId(articleId, userId, 'RESERVED', 'PUBLISHED');
}

function markAsPublishedByUserId(articleId, userId) {
    return transitionStatusByUserId(articleId, userId, 'PUBLISHED', 'RESERVED');
}

function markAsSoldByUserId(articleId, userId) {
    return transitionStatusByUserId(articleId, userId, 'SOLD', 'RESERVED');
}


async function publishByUserId(articleId, userId) {

    const result = await db.query(
        `UPDATE articles
         SET status = 'PUBLISHED',
             published_at = NOW()
         WHERE id = ?
         AND fk_users_id = ?
         AND status = 'DRAFT'`,
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

async function hasCoverImage(articleId) {
    const result = await db.query(
        `SELECT COUNT(*) AS count
         FROM articles_images
         WHERE fk_articles_id = ?
         AND is_cover = 1`,
        [articleId],
    );

    return result[0].count > 0;
}

async function getImagesByIds(articleId, imageIds) {
    if (!imageIds.length) {
        return [];
    }

    const placeholders = imageIds.map(() => '?').join(', ');

    return db.query(
        `SELECT id, image_url, is_cover, fk_articles_id
         FROM articles_images
         WHERE fk_articles_id = ?
         AND id IN (${placeholders})`,
        [articleId, ...imageIds],
    );
}

async function removeImages(articleId, imageIds, images) {
    const hadCover = images.some((image) => image.is_cover === 1);
    const placeholders = imageIds.map(() => '?').join(', ');

    await db.query(
        `DELETE FROM articles_images
         WHERE fk_articles_id = ?
         AND id IN (${placeholders})`,
        [articleId, ...imageIds],
    );

    if (hadCover) {
        await db.query(
            `UPDATE articles_images
             SET is_cover = 1
             WHERE fk_articles_id = ?
             ORDER BY id ASC
             LIMIT 1`,
            [articleId],
        );
    }
}

async function addImages(articleId, images) {
    if (!images.length) {
        return [];
    }

    const values = images.map((image) => [
        image.image_url,
        image.is_cover ? 1 : 0,
        articleId,
    ]);

    await db.query(
        `INSERT INTO articles_images
            (image_url, is_cover, fk_articles_id)
            VALUES ?`,
        [values],
    );

    const urls = images.map((image) => image.image_url);
    const placeholders = urls.map(() => '?').join(', ');

    return db.query(
        `SELECT *
         FROM articles_images
         WHERE fk_articles_id = ?
         AND image_url IN (${placeholders})`,
        [articleId, ...urls],
    );
}

async function getSimilar(articleId, currentUserId, limit = 3) {
    const [current] = await db.query(
        `SELECT a.id, a.fk_styles_id, m.fk_brands_id
         FROM articles a
         INNER JOIN models m ON m.id = a.fk_models_id
         WHERE a.id = ?`,
        [articleId],
    );

    if (!current) return [];

    const articles = await db.query(
        `SELECT
            a.id,
            a.title,
            a.description,
            a.price,
            a.condition,
            a.year_of_manufacture,
            p.city,
            p.country,
            (SELECT image_url FROM articles_images ai
                WHERE ai.fk_articles_id = a.id
                ORDER BY ai.is_cover DESC, ai.id ASC
                LIMIT 1) AS cover
         FROM articles a
         INNER JOIN models m ON m.id = a.fk_models_id
         LEFT JOIN profiles p ON p.fk_usuarios_id = a.fk_users_id
         WHERE a.id != ?
           AND a.status = 'PUBLISHED'
           AND (a.fk_styles_id = ? OR m.fk_brands_id = ?)
         ORDER BY (m.fk_brands_id = ?) DESC, a.published_at DESC
         LIMIT ?`,
        [articleId, current.fk_styles_id, current.fk_brands_id, current.fk_brands_id, limit],
    );

    if (!currentUserId || !articles.length) return articles;

    // Obtener qué artículos similares ya son favoritos del usuario
    const ids = articles.map(a => a.id);
    const placeholders = ids.map(() => '?').join(', ');
    const favs = await db.query(
        `SELECT fk_articles_id FROM favorite 
         WHERE fk_users_id = ? AND fk_articles_id IN (${placeholders})`,
        [currentUserId, ...ids],
    );

    const favSet = new Set(favs.map(f => f.fk_articles_id));
    return articles.map(a => ({ ...a, is_favorite: favSet.has(a.id) }));
}

async function getArticlesByDate(periodo) {
    let whereClause = `WHERE status = 'PUBLISHED'`;

    if (periodo === '7d') {
        whereClause += ` AND published_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
    } else if (periodo === '30d') {
        whereClause += ` AND published_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
    } else if (periodo === 'today') {
        whereClause += ` AND DATE(published_at) = CURDATE()`;
    }

    const result = await db.query(
        `SELECT DATE(published_at) AS date, COUNT(*) AS total
         FROM articles
         ${whereClause}
         GROUP BY DATE(published_at)
         ORDER BY DATE(published_at) ASC`
    );
    return result;
}


async function addFavorite(userId, articleId) {
    const existing = await db.query(
        `SELECT id FROM favorite WHERE fk_users_id = ? AND fk_articles_id = ?`,
        [userId, articleId],
    );

    if (existing.length) {
        return;
    }

    await db.query(
        `INSERT INTO favorite (created_at, fk_users_id, fk_articles_id) VALUES (NOW(), ?, ?)`,
        [userId, articleId],
    );
}

async function removeFavorite(userId, articleId) {
    await db.query(
        `DELETE FROM favorite WHERE fk_users_id = ? AND fk_articles_id = ?`,
        [userId, articleId],
    );
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
    markAsReservedByUserId,
    markAsPublishedByUserId,
    markAsSoldByUserId,
    publishByUserId,
    hasCoverImage,
    getImagesByIds,
    removeImages,
    addImages,
    getSimilar,
    getArticlesByDate,
    addFavorite,
    removeFavorite,
};