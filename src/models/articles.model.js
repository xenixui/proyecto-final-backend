const db = require('../config/database');


const getAll = async () => {
    const result = await db.query(`SELECT * FROM articles ORDER BY published_at DESC`)
    return result;
};

module.exports = {
    getAll
}