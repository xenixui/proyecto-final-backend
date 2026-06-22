
const reportService = require('../services/reportUser.service');

// POST /api/reports/users/:userId
async function reportUser(req, res, next) {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        const result = await reportService.reportUser(req.user.id, userId, reason);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

// GET /api/reports/mine
async function getMyUserReports(req, res, next) {
    try {
        const data = await reportService.getMyUserReports(req.user.id);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    reportUser,
    getMyUserReports,
};