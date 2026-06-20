
const reportService = require('../services/reportUser.service');

const reportController = {
    // POST /api/reports/users/:userId
    async reportUser(req, res, next) {
        try {
            const { userId } = req.params;
            const { reason } = req.body;
            const result = await reportService.reportUser(req.user.id, userId, reason);
            res.status(201).json({ success: true, ...result });
        } catch (err) {
            next(err);
        }
    },

    // GET /api/reports/mine
    async getMyUserReports(req, res, next) {
        try {
            const data = await reportService.getMyUserReports(req.user.id);
            res.json({ success: true, data });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = reportController;
