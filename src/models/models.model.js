const db = require('../config/database');

async function getByBrandId(brandId) {
    return db.query(
        `SELECT
            id,
            name,
            reference,
            movement_type,
            gender
         FROM models
         WHERE fk_brands_id = ?
         ORDER BY name ASC`,
        [brandId]
    );
}

module.exports = {
    getByBrandId
};