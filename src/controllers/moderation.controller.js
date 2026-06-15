const reportsModel = require('../models/reports.model');
const notificationsModel = require('../models/notifications.model');
const { withTransaction } = require('../config/database');

async function getReports(req, res, next) {
  try {
    const { status } = req.query;
    const reports = await reportsModel.getAll(status);
    return res.json({ data: reports, total: reports.length });
  } catch (error) {
    next(error);
  }
}

async function getReportById(req, res, next) {
  try {
    const { id } = req.params;
    const report = await reportsModel.getById(id);

    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    return res.json(report);
  } catch (error) {
    next(error);
  }
}

async function resolveReport(req, res, next) {
  try {
    const { id } = req.params;
    const { decision, moderator_note } = req.body;
    const moderatorId = req.user.id;

    const result = await withTransaction(async (connection) => {
      // 1. Fetch report with article owner info
      const [reports] = await connection.execute(
        `SELECT r.id, r.status, r.fk_articles_id, a.fk_users_id AS article_owner_id
         FROM reports r
         INNER JOIN articles a ON a.id = r.fk_articles_id
         WHERE r.id = ?
         LIMIT 1`,
        [id],
      );

      if (!reports.length) {
        const error = new Error('Reporte no encontrado');
        error.status = 404;
        throw error;
      }

      const report = reports[0];

      if (report.status === 'RESOLVED') {
        const error = new Error('El reporte ya fue resuelto');
        error.status = 409;
        throw error;
      }

      const now = new Date();

      // 2. If decision is RETIRED, update article status
      if (decision === 'RETIRED') {
        await connection.execute(
          "UPDATE articles SET status = 'RETIRED' WHERE id = ?",
          [report.fk_articles_id],
        );
      }

      // 3. Resolve the report
      await connection.execute(
        `UPDATE reports
         SET status = 'RESOLVED',
             resolution = ?,
             resolved_at = ?,
             fk_moderator_id = ?,
             moderator_note = ?
         WHERE id = ?`,
        [decision, now, moderatorId, moderator_note || null, id],
      );

      // 4. Notify article owner
      const notificationMessage =
        decision === 'RETIRED'
          ? 'Tu artículo ha sido retirado por incumplimiento de las normas de la plataforma.'
          : 'El reporte sobre tu artículo ha sido revisado y cerrado sin acción.';

      await notificationsModel.create(connection, {
        userId: report.article_owner_id,
        type: 'MODERATION',
        message: notificationMessage,
        articleId: report.fk_articles_id,
        reportId: report.id,
      });

      return { reportId: report.id, decision, resolved_at: now };
    });

    return res.json({
      message: 'Reporte resuelto correctamente',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

async function retireArticle(req, res, next) {
  try {
    const { id } = req.params;
    const moderatorId = req.user.id;

    const result = await withTransaction(async (connection) => {
      const [articles] = await connection.execute(
        'SELECT id, status, fk_users_id FROM articles WHERE id = ? LIMIT 1',
        [id],
      );

      if (!articles.length) {
        const error = new Error('Artículo no encontrado');
        error.status = 404;
        throw error;
      }

      const article = articles[0];

      if (article.status === 'RETIRED') {
        const error = new Error('El artículo ya está retirado');
        error.status = 409;
        throw error;
      }

      await connection.execute(
        "UPDATE articles SET status = 'RETIRED' WHERE id = ?",
        [id],
      );

      await notificationsModel.create(connection, {
        userId: article.fk_users_id,
        type: 'MODERATION',
        message: 'Tu artículo ha sido retirado por un moderador de la plataforma.',
        articleId: article.id,
        reportId: null,
      });

      return { articleId: article.id, status: 'RETIRED', moderatorId };
    });

    return res.json({
      message: 'Artículo retirado correctamente',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getReports, getReportById, resolveReport, retireArticle };
