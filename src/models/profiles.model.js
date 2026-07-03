const db = require('../config/database');

async function getAllProfiles() {
    const result = await db.query(`SELECT * FROM profiles `);
    return result;
}

async function getProfilesByRole(rol) {
    const result = await db.query(
        `SELECT p.*, r.rol, u.status
        FROM profiles p
        INNER JOIN users u ON u.id = p.fk_usuarios_id
        INNER JOIN users_roles ur ON ur.fk_users_id = u.id
        INNER JOIN roles r ON r.id = ur.fk_roles_id
        WHERE r.rol = ?`,
        [rol],
    );
    return result;
}

async function getByUserId(userId) {
    const result = await db.query(
    `SELECT id, username, rating, photo_url, name, surname, phone, country, city, postal_code, biography, created_at, fk_usuarios_id
        FROM profiles
        WHERE fk_usuarios_id = ?
        LIMIT 1`,
        [userId],
    );

    return result[0] || null;
}

async function getPublicStatsByUser(userId) {
    const [stats] = await db.query(
        `SELECT
            COALESCE(SUM(CASE WHEN a.fk_users_id = ? AND a.status = 'SOLD' THEN 1 ELSE 0 END), 0) AS sales_count,
            COALESCE(SUM(CASE WHEN a.fk_buyer_id = ? AND a.status = 'SOLD' THEN 1 ELSE 0 END), 0) AS purchases_count
         FROM articles a`,
        [userId, userId],
    );

    const [reviews] = await db.query(
        `SELECT
            COUNT(*) AS reviews_count,
            COALESCE(ROUND(AVG(stars), 2), 0) AS rating
         FROM reviews
         WHERE fk_seller_id = ?`,
        [userId],
    );

    return {
        sales_count: Number(stats?.sales_count || 0),
        purchases_count: Number(stats?.purchases_count || 0),
        reviews_count: Number(reviews?.reviews_count || 0),
        rating: Number(reviews?.rating || 0),
    };
}

async function getPublicReviewsByUser(userId) {
    return await db.query(
        `SELECT
            r.stars,
            r.comentario,
            r.created_at,
            r.fk_article_id,
            a.title AS article_title,
            buyer_profile.name AS reviewer_name,
            buyer_profile.surname AS reviewer_surname,
            buyer_profile.username AS reviewer_username
         FROM reviews r
         LEFT JOIN articles a ON a.id = r.fk_article_id
         LEFT JOIN profiles buyer_profile ON buyer_profile.fk_usuarios_id = r.fk_buyer_id
         WHERE r.fk_seller_id = ?
         ORDER BY r.created_at DESC`,
        [userId],
    );
}

async function getFavoriteArticlesByUser(userId) {
    return await db.query(
        `SELECT
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
            a.fk_users_id,
            a.fk_buyer_id,
            a.fk_styles_id,
            a.fk_models_id,
            f.created_at AS favorite_created_at,
            ai.image_url AS cover
         FROM favorite f
         INNER JOIN articles a ON a.id = f.fk_articles_id
         LEFT JOIN articles_images ai
            ON ai.fk_articles_id = a.id
           AND ai.is_cover = 1
         WHERE f.fk_users_id = ?
         ORDER BY f.created_at DESC`,
        [userId],
    );
}
async function getSalesByUser(fk_users_id) {
    const result = await db.query(
        `SELECT a.id, a.title, a.description, a.price, a.condition, a.status,
                (SELECT image_url FROM articles_images 
                WHERE fk_articles_id = a.id AND is_cover = 1 
                LIMIT 1) AS cover_image
        FROM articles a
        WHERE a.fk_users_id = ?`,
        [fk_users_id],
    );
    if (result.length === 0) return null;
    return result;
}

async function getPurchasesByUser(fk_buyer_id) {
    const result = await db.query(
        `SELECT a.id, a.title, a.description, a.price, a.condition, a.status,
                (SELECT image_url FROM articles_images 
                WHERE fk_articles_id = a.id AND is_cover = 1 
                LIMIT 1) AS cover_image
        FROM articles a
        WHERE a.fk_buyer_id = ?`,
        [fk_buyer_id],
    );
    if (result.length === 0) return null;
    return result;
}

async function getReviewsByUser(fk_buyer_id, fk_seller_id) {
    const result = await db.query(
        `SELECT stars, comentario, created_at, fk_article_id
        FROM reviews
        WHERE fk_buyer_id = ? OR fk_seller_id = ?`,
        [fk_buyer_id, fk_seller_id],
    );
    if (result.length === 0) return null;
    return result;
}

async function getReportsByUser(fk_users_id) {
    const result = await db.query(
        `SELECT reason, comments, status, created_at, fk_articles_id
        FROM reports
        WHERE fk_users_id = ?`,
        [fk_users_id],
    );
    if (result.length === 0) return null;
    return result;
}

async function getFavoritesByUser(fk_users_id) {
    const result = await db.query(
        `SELECT created_at, fk_articles_id
        FROM favorite
        WHERE fk_users_id = ?`,
        [fk_users_id],
    );
    if (result.length === 0) return null;
    return result;
}

// Dar de alta
async function createUserByAdmin(data) {
    const result = await db.query(
        `INSERT INTO users (email, password, status, created_at, update_at) VALUES 
        (?, ?, ?, NOW(), NOW())`,
        [data.email, data.hashedPassword, 'ACTIVE'],
    );
    const newUserId = result.insertId;

    const roleResult = await db.query(
        `SELECT id FROM roles WHERE rol = ? LIMIT 1`,
        [data.rol.toLowerCase()],
    );
    const roleId = roleResult[0].id;

    await db.query(
        `INSERT INTO users_roles (fk_users_id, fk_roles_id, assigned_at) 
        VALUES (?, ?, NOW())`,
        [newUserId, roleId],
    );

    await db.query(
        `INSERT INTO profiles (username, name, country, city, postal_code, created_at, fk_usuarios_id) 
        VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
        [data.username, data.name, '', '', '', newUserId],
    );

    return {
        id: newUserId,
    };
}

// Dar de baja
async function deactivateUser(userId) {
    const result = await db.query(
        `UPDATE users SET status = 'DELETED' WHERE id = ?`,
        [userId],
    );
    return result;
}

// Bloquear

async function blockUser(userId, connection) {
    const sql = `UPDATE users SET status = 'BLOCKED' WHERE id = ?`;

    if (connection) {
        const [result] = await connection.execute(sql, [userId]);
        return result;
    }

    const result = await db.query(sql, [userId]);
    return result;
}

// Desbloquear
async function unblockUser(userId) {
    const result = await db.query(
        `UPDATE users SET status = 'ACTIVE' WHERE id = ?`,
        [userId],
    );
    return result;
}

// Asignar role
async function assignRole(userId, rolName) {
    const roleResult = await db.query(
        `SELECT id FROM roles WHERE rol = ? LIMIT 1`,
        [rolName],
    );

    if (roleResult.length === 0) return null;

    const roleId = roleResult[0].id;

    const result = await db.query(
        `INSERT INTO users_roles (fk_users_id, fk_roles_id, assigned_at)
        VALUES (?, ?, NOW())`,
        [userId, roleId],
    );
    return result;
}
// Quitar rol

async function removeRole(userId, rolId) {
    const result = await db.query(
        `DELETE FROM users_roles WHERE fk_users_id = ?
        AND fk_roles_id = ?`,
        [userId, rolId],
    );
    return result;
}

module.exports = {
    getAllProfiles,
    getProfilesByRole,
    getByUserId,
    getPublicStatsByUser,
    getPublicReviewsByUser,
    getFavoriteArticlesByUser,
    getPurchasesByUser,
    getSalesByUser,
    getReviewsByUser,
    getReportsByUser,
    getFavoritesByUser,
    createUserByAdmin,
    deactivateUser,
    blockUser,
    unblockUser,
    assignRole,
    removeRole,
};
