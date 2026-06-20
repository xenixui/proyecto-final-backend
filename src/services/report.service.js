const reportModel = require('../models/reports.model')

async function createReport(data) {
    const report = await reportModel.insertReport(
        data.reason,
        data.comments,
        data.fk_articles_id,
        data.fk_users_id)
        
    return report
}

module.exports = {
    createReport
}