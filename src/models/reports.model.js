const { query } = require('../config/database');

async function getAll(status) {
  let sql = `
    SELECT
      r.id,
      r.reason,
      r.status,
      r.resolution,
      r.moderator_note,
      r.created_at,
      r.resolved_at,
      r.fk_articles_id AS article_id,
      a.title AS article_title,
      a.status AS article_status,
      r.fk_users_id AS reporter_id,
      u.email AS reporter_email,
      r.fk_moderator_id AS moderator_id
    FROM reports r
    INNER JOIN articles a ON a.id = r.fk_articles_id
    INNER JOIN users u ON u.id = r.fk_users_id
  `;
  const params = [];

  if (status) {
    sql += ' WHERE r.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY r.created_at DESC';

  return query(sql, params);
}

async function getById(id) {
  const result = await query(
    `SELECT
      r.id,
      r.reason,
      r.status,
      r.resolution,
      r.moderator_note,
      r.created_at,
      r.resolved_at,
      r.fk_articles_id AS article_id,
      a.title AS article_title,
      a.description AS article_description,
      a.status AS article_status,
      a.fk_users_id AS article_owner_id,
      r.fk_users_id AS reporter_id,
      u.email AS reporter_email,
      r.fk_moderator_id AS moderator_id
    FROM reports r
    INNER JOIN articles a ON a.id = r.fk_articles_id
    INNER JOIN users u ON u.id = r.fk_users_id
    WHERE r.id = ?
    LIMIT 1`,
    [id],
  );

  return result[0] || null;
}

module.exports = { getAll, getById };
