const db = require('../config/database');


const getAll = async () => {
    const result = await db.query(`SELECT * FROM articles`)
    return result;
};

module.exports = {
    getAll
}