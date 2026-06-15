async function create(
  connection,
  { userId, type, message, articleId = null, reportId = null },
) {
  const now = new Date();
  const [result] = await connection.execute(
    `INSERT INTO notifications (message, type, is_read, created_at, fk_users_id, fk_articles_id, fk_reports_id)
     VALUES (?, ?, 0, ?, ?, ?, ?)`,
    [message, type, now, userId, articleId, reportId],
  );
  return result.insertId;
}

module.exports = { create };
