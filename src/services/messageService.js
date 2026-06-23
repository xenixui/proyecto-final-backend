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
    `SELECT c.id, c.fk_buyer_id, c.fk_articles_id, a.fk_users_id AS seller_id
     FROM chats c
     INNER JOIN articles a ON a.id = c.fk_articles_id
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

    return {
      chatId,
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
