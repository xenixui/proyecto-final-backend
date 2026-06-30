const { withTransaction } = require('../config/database');

function createNotFoundError(message) {
  const error = new Error(message);
  error.status = 404;
  return error;
}

function createForbiddenError(message) {
  const error = new Error(message);
  error.status = 403;
  return error;
}

async function getChatById(chatId, connection) {
  const [rows] = await connection.execute(
    `SELECT
        c.id,
        c.created_at,
        c.fk_buyer_id,
        c.fk_articles_id,
        a.fk_users_id AS seller_id,
        a.id AS article_id,
        a.title AS article_title,
        a.description AS article_description,
        a.price AS article_price,
        a.status AS article_status,
        a.condition AS article_condition,
        a.year_of_manufacture,
        ai.image_url AS article_cover,
        m.reference AS model_reference,
        m.movement_type,
        s.name AS style_name,
        buyer_profile.username AS buyer_name,
        buyer_profile.photo_url AS buyer_photo,
        seller_profile.username AS seller_name,
        seller_profile.photo_url AS seller_photo
     FROM chats c
     INNER JOIN articles a ON a.id = c.fk_articles_id
     LEFT JOIN articles_images ai ON ai.fk_articles_id = a.id AND ai.is_cover = 1
     LEFT JOIN models m ON m.id = a.fk_models_id
     LEFT JOIN styles s ON s.id = a.fk_styles_id
     LEFT JOIN profiles buyer_profile ON buyer_profile.fk_usuarios_id = c.fk_buyer_id
     LEFT JOIN profiles seller_profile ON seller_profile.fk_usuarios_id = a.fk_users_id
     WHERE c.id = ?
     LIMIT 1`,
    [chatId]
  );

  return rows[0] || null;
}

function assertCanAccessChat(chat, userId) {
  const isParticipant = Number(chat.fk_buyer_id) === Number(userId)
    || Number(chat.seller_id) === Number(userId);

  if (!isParticipant) {
    throw createForbiddenError('No tienes permisos para acceder a este chat');
  }
}

async function getChatMessagesAndMarkRead(chatId, userId) {
  return withTransaction(async (connection) => {
    const chat = await getChatById(chatId, connection);

    if (!chat) {
      throw createNotFoundError('Chat no encontrado');
    }

    assertCanAccessChat(chat, userId);

    await connection.execute(
      `UPDATE messages
       SET is_read = 1
       WHERE fk_chats_id = ?
         AND is_read = 0
         AND fk_sender_id <> ?`,
      [chatId, userId]
    );

    const [messages] = await connection.execute(
      `SELECT id, message, created_at, is_read, fk_chats_id, fk_sender_id
       FROM messages
       WHERE fk_chats_id = ?
       ORDER BY created_at ASC, id ASC`,
      [chatId]
    );

    const isBuyer = Number(chat.fk_buyer_id) === Number(userId);
    const isSeller = Number(chat.seller_id) === Number(userId);

    return {
      chatId,
      chat: {
        id: chat.id,
        created_at: chat.created_at,
        contact_name: isBuyer ? chat.seller_name : chat.buyer_name,
        contact_photo: isBuyer ? chat.seller_photo : chat.buyer_photo,
        can_manage_article: isSeller,
        article: {
          id: chat.article_id,
          title: chat.article_title,
          description: chat.article_description,
          price: chat.article_price,
          status: chat.article_status,
          condition: chat.article_condition,
          year_of_manufacture: chat.year_of_manufacture,
          cover: chat.article_cover,
          reference: chat.model_reference,
          movement_type: chat.movement_type,
          style_name: chat.style_name,
        },
      },
      messages,
    };
  });
}

async function createChatMessage(chatId, userId, message) {
  return withTransaction(async (connection) => {
    const chat = await getChatById(chatId, connection);

    if (!chat) {
      throw createNotFoundError('Chat no encontrado');
    }

    assertCanAccessChat(chat, userId);

    const [insertResult] = await connection.execute(
      `INSERT INTO messages (message, created_at, is_read, fk_chats_id, fk_sender_id)
       VALUES (?, NOW(), 0, ?, ?)`,
      [message, chatId, userId]
    );

    await connection.execute(
      `UPDATE chats
       SET update_at = NOW()
       WHERE id = ?`,
      [chatId]
    );

    const [messages] = await connection.execute(
      `SELECT id, message, created_at, is_read, fk_chats_id, fk_sender_id
       FROM messages
       WHERE id = ?`,
      [insertResult.insertId]
    );

    return messages[0];
  });
}

module.exports = {
  getChatMessagesAndMarkRead,
  createChatMessage,
};
