const db = require('../config/database');


const getAll = async () => {
    const [result] = await db.query(`SELECT * FROM authors`)
    return result;
};