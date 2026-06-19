const { query } = require("../config/database");

// Cualquier usuario autenticado puede reportar un artículo
// Un usuario no puede reportar su propio artículo
// Un usuario no puede reportar el mismo artículo dos veces
async function reportArticle(userId, articleId, reason) {
  if (!reason || reason.trim().length < 10) {
    throw { status: 400, message: "El motivo debe tener al menos 10 caracteres" };
  }

  // Comprueba que el artículo existe y está publicado
  const [article] = await query(
    "SELECT id, fk_users_id FROM articles WHERE id = ? AND status = 'PUBLISHED'",
    [articleId]
  );
  if (!article) {
    throw { status: 404, message: "Artículo no encontrado o no está publicado" };
  }

  // No puedes reportar tu propio artículo
  if (article.fk_users_id === userId) {
    throw { status: 400, message: "No puedes reportar tu propio artículo" };
  }

  // Evita reportes duplicados del mismo usuario al mismo artículo
  const [existing] = await query(
    `SELECT id FROM reports
     WHERE fk_articles_id = ? AND fk_users_id = ? AND status != 'RESOLVED'`,
    [articleId, userId]
  );
  if (existing) {
    throw { status: 409, message: "Ya has reportado este artículo anteriormente" };
  }

  await query(
    `INSERT INTO reports (reason, status, created_at, fk_articles_id, fk_users_id)
     VALUES (?, 'PENDING', NOW(), ?, ?)`,
    [reason.trim(), articleId, userId]
  );

  return { message: "Artículo reportado correctamente. Lo revisaremos pronto." };
}

// El usuario puede ver los reportes que ha enviado y su estado
async function getMyReports(userId) {
  return await query(
    `SELECT
       r.id,
       r.reason,
       r.status,
       r.created_at,
       r.resolution,
       r.resolved_at,
       a.title        AS article_title,
       a.id           AS article_id
     FROM reports r
     JOIN articles a ON a.id = r.fk_articles_id
     WHERE r.fk_users_id = ?
     ORDER BY r.created_at DESC`,
    [userId]
  );
}

module.exports = {
  reportArticle,
  getMyReports,
};
