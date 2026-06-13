const userService = require('../services/userService');

async function register(req, res, next) {
    try {
        const result = await userService.registerUser(req.body);
        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
};
