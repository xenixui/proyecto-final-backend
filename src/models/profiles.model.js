const db = require('../config/database');

async function getAllProfiles(rol) {
    const result = await db.query(
        `SELECT p.*
        FROM profiles p
        INNER JOIN users u ON u.id = p.fk_usuarios_id
        INNER JOIN users_roles ur ON ur.fk_users_id = u.id
        INNER JOIN roles r ON r.id = ur.fk_roles_id
        WHERE r.rol = ?`,
        [rol]
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

async function getUserBasicData(userId) {
    const result = await db.query(
        `SELECT u.created_at, 
            u.status,
            p.username,
            p.name,
            p.surname,
            p.city ,
            p.country 
    FROM users AS u
    INNER JOIN profiles AS p ON p.fk_usuarios_id = u.id
    WHERE u.id = ?`,
        [userId]
    );

    if (result.length === 0) return null
    return result[0];
}

async function getPurchasesByUser(fk_buyer_id) {
    const result = await db.query(
        `SELECT title, description, price, condition, status
        FROM articles
        WHERE fk_buyer_id = ?`,
        [fk_buyer_id]
    );
    if (result.length === 0) return null
    return result
}

async function getSalesByUser(fk_users_id) {
    const result = await db.query(
        `SELECT title, description, price, condition, status
        FROM articles
        WHERE fk_users_id = ?`,
        [fk_users_id]
    );
    if (result.length === 0) return null
    return result
}

async function getReviewsByUser(fk_buyer_id, fk_seller_id) {
    const result = await db.query(
        `SELECT stars, comentario, created_at, fk_article_id
        FROM reviews
        WHERE fk_buyer_id = ? OR fk_seller_id = ?`,
        [fk_buyer_id, fk_seller_id]
    );
    if (result.length === 0) return null
    return result
}

async function getReportsByUser(fk_users_id) {
    const result = await db.query(
        `SELECT reason, comments, status, created_at, fk_articles_id
        FROM reports
        WHERE fk_users_id = ?`,
        [fk_users_id]
    );
    if (result.length === 0) return null
    return result
}

async function getFavoritesByUser(fk_users_id) {
    const result = await db.query(
        `SELECT created_at, fk_articles_id
        FROM favorite
        WHERE fk_users_id = ?`,
        [fk_users_id]
    );
    if (result.length === 0) return null
    return result
}

// Dar de alta
async function createUserByAdmin(data) {
    const result = await db.query(
        `INSERT INTO users (email, password, status, created_at, update_at) VALUES 
        (?, ?, ?, NOW(), NOW())`,
        [data.email, data.hashedPassword, 'ACTIVE']
    )
    const newUserId = result.insertId

    const roleResult = await db.query(
        `SELECT id FROM roles WHERE rol = ? LIMIT 1`,
        [data.rol.toLowerCase()]
    );
    const roleId = roleResult[0].id

    await db.query(
        `INSERT INTO users_roles (fk_users_id, fk_roles_id, assigned_at) 
        VALUES (?, ?, NOW())`,
        [newUserId, roleId]
    )

    await db.query(
        `INSERT INTO profiles (username, name, country, city, postal_code, created_at, fk_usuarios_id) 
        VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
        [data.username, data.name, '', '', '', newUserId]
    );

    return {
        id: newUserId
    }
}

// Dar de baja
async function deactivateUser(userId) {
    const result = await db.query(
        `UPDATE users SET status = 'DELETED' WHERE id = ?`,
        [userId]
    );
    return result;
}


// Bloquear

async function blockUser(userId) {
    const result = await db.query(
        `UPDATE users SET status = 'BLOCKED' WHERE id = ?`,
        [userId]
    )
    return result
}


// Asignar role
async function assignRole(userId, rolName) {
    const roleResult = await db.query(
        `SELECT id FROM roles WHERE rol = ? LIMIT 1`,
        [rolName]
    )

    if(roleResult.length === 0) return null

    const roleId = roleResult[0].id

    const result = await db.query(
        `INSERT INTO users_roles (fk_users_id, fk_roles_id, assigned_at)
        VALUES (?, ?, NOW())`,
        [userId, roleId]
    )
    return result
}
// Quitar rol 

async function removeRole (userId, rolId) {
    const result = await db.query (
        `DELETE FROM users_roles WHERE fk_users_id = ?
        AND fk_roles_id = ?`,
        [userId, rolId]
    )
    return result
}

module.exports = {
    getAllProfiles,
    getByUserId,
    getUserBasicData,
    getPurchasesByUser,
    getSalesByUser,
    getReviewsByUser,
    getReportsByUser,
    getFavoritesByUser,
    createUserByAdmin,
    deactivateUser,
    blockUser,
    assignRole,
    removeRole
}

