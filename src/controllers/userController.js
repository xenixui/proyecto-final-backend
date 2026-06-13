const userService = require('../services/userService');

async function register(req, res) {
    try {
        const result = await userService.registerUser(req.body);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(error.status).json(error.message);
    }
}

module.exports = {
    register,
};
