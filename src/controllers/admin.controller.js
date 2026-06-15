const AdminModel = require('../models/admin.models');

async function getProfiles(req, res) {
    try {
        const result = await AdminModel.getAllProfiles();
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar los perfiles',
            error: error.message
        });
    }
}

module.exports = {
    getProfiles
}