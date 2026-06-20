const { query } = require('../config/database');

async function countGestionados() {
    const result = await query(
        "SELECT COUNT(*) AS total FROM reports WHERE status = 'RESOLVED'",
    );

    return result[0].total;
}

module.exports = {
    countGestionados,
};
