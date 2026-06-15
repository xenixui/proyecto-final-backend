const db = require('../config/database');

async function getAllProfiles() {
    const result = await db.query(`SELECT * FROM profiles`);
    return result;
}

module.exports = {
    getAllProfiles
}