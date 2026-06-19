// src/services/profileService.js
// Lógica de negocio del perfil de usuario

const { query } = require("../config/database");

// ─── Ver perfil ───────────────────────────────────────────────
// Une users + profiles usando la FK real: profiles.fk_usuarios_id
async function getProfile(userId) {
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
       p.rating
     FROM users u
     JOIN profiles p ON p.fk_usuarios_id = u.id
     WHERE u.id = ?`,
    [userId]
  );

  if (!row) throw { status: 404, message: "Usuario no encontrado" };
  return row;
}

// ─── Editar perfil ────────────────────────────────────────────
// Actualiza los campos editables de profiles (no el email ni el password)
async function updateProfile(userId, data) {
  const { username, name, surname, photo_url, phone, country, city, postal_code, biography } = data;

  if (!username) throw { status: 400, message: "El username es obligatorio" };

  // Comprueba que el username no esté ya en uso por otro usuario
  const [existing] = await query(
    "SELECT id FROM profiles WHERE username = ? AND fk_usuarios_id != ?",
    [username, userId]
  );
  if (existing) throw { status: 409, message: "El username ya está en uso" };

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
    [username, name || null, surname || null, photo_url || null,
     phone || null, country, city, postal_code, biography || null, userId]
  );

  // Devuelve el perfil actualizado
  return await getProfile(userId);
}

// ─── Mis artículos publicados ─────────────────────────────────
// articles.fk_users_id apunta al vendedor
// Incluye la imagen de portada desde articles_images (is_cover = 1)
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
    [userId]
  );
}

// ─── Mis compras ──────────────────────────────────────────────
// Un artículo "comprado" por el usuario = chat donde él es fk_buyer_id
// y el article tiene status SOLD
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
    [userId]
  );
}

// ─── Mis ventas ───────────────────────────────────────────────
// Una "venta" = artículo del usuario con status SOLD
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
     JOIN brands b         ON b.id = m.fk_brands_id
     LEFT JOIN articles_images ai
       ON ai.fk_articles_id = a.id AND ai.is_cover = 1
     LEFT JOIN chats c     ON c.fk_articles_id = a.id
     LEFT JOIN profiles p  ON p.fk_usuarios_id = c.fk_buyer_id
     WHERE a.fk_users_id = ?
       AND a.status = 'SOLD'
     ORDER BY a.published_at DESC`,
    [userId]
  );
}

// ─── Mis chats ────────────────────────────────────────────────
// Trae todos los chats donde el usuario participa:
//   - como comprador (fk_buyer_id)
//   - como vendedor (articles.fk_users_id)
// Incluye el último mensaje de cada chat
async function getMyChats(userId) {
  return await query(
    `SELECT
       c.id              AS chat_id,
       a.id              AS article_id,
       a.title           AS article_title,
       ai.image_url      AS article_cover,
       -- Datos del otro participante
       IF(c.fk_buyer_id = ?, p_seller.username, p_buyer.username)  AS contact_username,
       IF(c.fk_buyer_id = ?, p_seller.photo_url, p_buyer.photo_url) AS contact_photo,
       -- Rol del usuario autenticado en este chat
       IF(c.fk_buyer_id = ?, 'BUYER', 'SELLER')                   AS my_role,
       -- Último mensaje
       last_msg.message       AS last_message,
       last_msg.created_at    AS last_message_at,
       last_msg.fk_sender_id  AS last_sender_id,
       -- Mensajes no leídos por el usuario autenticado
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
     -- Perfil del vendedor (dueño del artículo)
     JOIN profiles p_seller  ON p_seller.fk_usuarios_id = a.fk_users_id
     -- Perfil del comprador
     JOIN profiles p_buyer   ON p_buyer.fk_usuarios_id  = c.fk_buyer_id
     -- Último mensaje del chat
     LEFT JOIN (
     SELECT m1.* FROM messages m1
     INNER JOIN (
     SELECT fk_chats_id, MAX(created_at) AS max_date
     FROM messages GROUP BY fk_chats_id
  ) m2 ON m1.fk_chats_id = m2.fk_chats_id AND m1.created_at = m2.max_date
) last_msg ON last_msg.fk_chats_id = c.id
     WHERE c.fk_buyer_id = ?          -- soy el comprador
        OR a.fk_users_id = ?          -- soy el vendedor
     ORDER BY last_msg.created_at DESC`,
    // Parámetros en orden de aparición de los ?
    [userId, userId, userId, userId, userId, userId]
  );
}

module.exports = {
  getProfile,
  updateProfile,
  getMyArticles,
  getMyPurchases,
  getMySales,
  getMyChats,
};
