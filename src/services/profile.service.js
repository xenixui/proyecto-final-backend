const profileModel = require('../models/profiles.model');
const {
    hashPassword
} = require('../utils/password');
const userModel = require('../models/user.model');

async function getProfileDetail(userId) {
    let user;
    try {
        user = await getProfileByUser(userId);
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        return null;
    }

    const purchases = (await profileModel.getPurchasesByUser(userId)) || [];
    const sales = (await profileModel.getSalesByUser(userId)) || [];
    const reviews = (await profileModel.getReviewsByUser(userId, userId)) || [];
    const reports = (await profileModel.getReportsByUser(userId)) || [];
    const favorites = (await profileModel.getFavoritesByUser(userId)) || [];

    return {
        user,
        purchases,
        sales,
        reviews,
        reports,
        favorites,
    };
}

async function createUserAsAdmin(data) {
    const userExist = await userModel.getUserByEmail(data.email);
    if (userExist) {
        const error = new Error('Ya existe un usuario con ese email');
        error.status = 409;
        throw error;
    }

    const newUser = await profileModel.createUserByAdmin({
        email: data.email,
        hashedPassword: hashPassword(data.password),
        name: data.name,
        username: data.username,
        rol: data.rol,
    });

    return {
        id: newUser.id,
        message: 'Nuevo usuario creado',
    };
}

// src/services/profile.service.js
// Lógica de negocio del perfil de usuario

const {
    query
} = require('../config/database');

// ─── Ver perfil ───────────────────────────────────────────────
async function getProfileByUser(userId) {
    const [row] = await query(
        `SELECT
           u.id,
           u.email,
           u.status,
           u.created_at,
           u.last_login,
           p.username,
           p.name,
           p.surname,
           p.photo_url,
           p.phone,
           p.country,
           p.city,
           p.postal_code,
           p.biography,
           p.rating,
           p.fk_usuarios_id
         FROM users u
         JOIN profiles p ON p.fk_usuarios_id = u.id
         WHERE u.id = ?`,
        [userId],
    );

    if (!row)
        throw {
            status: 404,
            message: 'Usuario no encontrado',
        };
    return row;
}

// ─── Editar perfil ────────────────────────────────────────────
async function updateProfile(userId, data) {
    const {
        username,
        name,
        surname,
        photo_url,
        phone,
        country,
        city,
        postal_code,
        biography,
    } = data;

    // Comprueba que el perfil exista antes de intentar actualizarlo
    const [{
        total: profileExists
    }] = await query(
        'SELECT COUNT(*) AS total FROM profiles WHERE fk_usuarios_id = ?',
        [userId],
    );
    if (profileExists === 0) {
        throw {
            status: 404,
            message: 'Perfil no encontrado',
        };
    }

    // Comprueba si YA existe ese username en algún otro usuario (excluyéndome a mí mismo)
    // Usamos COUNT en vez de traer una fila: así sabemos cuántas coincidencias hay
    // y no dependemos de qué fila concreta devuelva la BD primero.
    const [{
        total: usernameTaken
    }] = await query(
        'SELECT COUNT(*) AS total FROM profiles WHERE username = ? AND fk_usuarios_id != ?',
        [username, userId],
    );
    if (usernameTaken > 0)
        throw {
            status: 409,
            message: 'El username ya está en uso',
        };

    await query(
        `UPDATE profiles
         SET username     = ?,
             name         = ?,
             surname      = ?,
             photo_url    = ?,
             phone        = ?,
             country      = ?,
             city         = ?,
             postal_code  = ?,
             biography    = ?
         WHERE fk_usuarios_id = ?`,
        [
            username,
            name || null,
            surname || null,
            photo_url || null,
            phone || null,
            country,
            city,
            postal_code,
            biography || null,
            userId,
        ],
    );

    return await getProfileByUser(userId);
}

// ─── Mis artículos publicados ─────────────────────────────────
async function getMyArticles(userId) {
    return await query(
        `SELECT
           a.id,
           a.title,
           a.price,
           a.condition,
           a.status,
           a.published_at,
           b.name  AS brand,
           m.name  AS model,
           ai.image_url AS cover_image
         FROM articles a
         JOIN models m        ON m.id = a.fk_models_id
         JOIN brands b        ON b.id = m.fk_brands_id
         LEFT JOIN articles_images ai
           ON ai.fk_articles_id = a.id AND ai.is_cover = 1
         WHERE a.fk_users_id = ?
         ORDER BY a.published_at DESC`,
        [userId],
    );
}

// ─── Mis compras ──────────────────────────────────────────────
// Compra = chat donde el usuario es comprador + el artículo está SOLD
async function getMyPurchases(userId) {
    return await query(
        `SELECT
           a.id          AS article_id,
           a.title,
           a.price,
           a.status      AS article_status,
           b.name        AS brand,
           m.name        AS model,
           ai.image_url  AS cover_image,
           p.username    AS seller_username,
           c.created_at  AS chat_started_at
         FROM chats c
         JOIN articles a       ON a.id = c.fk_articles_id
         JOIN models m         ON m.id = a.fk_models_id
         JOIN brands b         ON b.id = m.fk_brands_id
         JOIN profiles p       ON p.fk_usuarios_id = a.fk_users_id
         LEFT JOIN articles_images ai
           ON ai.fk_articles_id = a.id AND ai.is_cover = 1
         WHERE c.fk_buyer_id = ?
           AND a.status = 'SOLD'
         ORDER BY c.created_at DESC`,
        [userId],
    );
}

// ─── Mis ventas ───────────────────────────────────────────────
// Venta = artículo propio con status SOLD
async function getMySales(userId) {
    return await query(
        `SELECT
           a.id          AS article_id,
           a.title,
           a.price,
           a.published_at,
           b.name        AS brand,
           m.name        AS model,
           ai.image_url  AS cover_image,
           p.username    AS buyer_username
         FROM articles a
         JOIN models m         ON m.id = a.fk_models_id
         JOIN brands b        ON b.id = m.fk_brands_id
         LEFT JOIN articles_images ai
           ON ai.fk_articles_id = a.id AND ai.is_cover = 1
         LEFT JOIN chats c     ON c.fk_articles_id = a.id
         LEFT JOIN profiles p  ON p.fk_usuarios_id = c.fk_buyer_id
         WHERE a.fk_users_id = ?
           AND a.status = 'SOLD'
         ORDER BY a.published_at DESC`,
        [userId],
    );
}

// ─── Mis chats ────────────────────────────────────────────────
// Cubre los dos roles: comprador (fk_buyer_id) o vendedor (dueño del articles)
// Subquery en FROM (no en ON) porque TiDB no soporta subqueries dentro de ON.
async function getMyChats(userId) {
    return await query(
        `SELECT
           c.id              AS chat_id,
           a.id              AS article_id,
           a.title           AS article_title,
           a.price           AS article_price,
           a.status          AS article_status,
           ai.image_url      AS article_cover,
           IF(c.fk_buyer_id = ?, p_seller.username, p_buyer.username)   AS contact_username,
           IF(c.fk_buyer_id = ?, p_seller.photo_url, p_buyer.photo_url) AS contact_photo,
           IF(c.fk_buyer_id = ?, 'BUYER', 'SELLER')                     AS my_role,
           p_buyer.username  AS buyer_name,
           last_msg.message      AS last_message,
           last_msg.created_at   AS last_message_at,
           last_msg.fk_sender_id AS last_sender_id,
           (
             SELECT COUNT(*) FROM messages
             WHERE fk_chats_id = c.id
               AND is_read = 0
               AND fk_sender_id != ?
           ) AS unread_count
         FROM chats c
         JOIN articles a         ON a.id = c.fk_articles_id
         LEFT JOIN articles_images ai
           ON ai.fk_articles_id = a.id AND ai.is_cover = 1
         JOIN profiles p_seller  ON p_seller.fk_usuarios_id = a.fk_users_id
         JOIN profiles p_buyer   ON p_buyer.fk_usuarios_id  = c.fk_buyer_id
         LEFT JOIN (
           SELECT m1.*
           FROM messages m1
           INNER JOIN (
             SELECT fk_chats_id, MAX(created_at) AS max_date
             FROM messages
             GROUP BY fk_chats_id
           ) m2 ON m1.fk_chats_id = m2.fk_chats_id AND m1.created_at = m2.max_date
         ) last_msg ON last_msg.fk_chats_id = c.id
         WHERE c.fk_buyer_id = ?
            OR a.fk_users_id = ?
         ORDER BY last_msg.created_at DESC`,
        [userId, userId, userId, userId, userId, userId],
    );
}

module.exports = {
    getProfileDetail,
    createUserAsAdmin,
    getProfileByUser,
    updateProfile,
    getMyArticles,
    getMyPurchases,
    getMySales,
    getMyChats,
};