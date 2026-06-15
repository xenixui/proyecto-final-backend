const userService = require('../services/user.service');
const userModel = require('../models/user.model');

async function register(req, res) {
    try {
        const result = await userService.registerUser(req.body);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(error.status).json(error.message);
    }
}

async function getMyPosts(req, res, next) {
    try {
        const posts = await userModel.getPostsByUserId(req.user.id);
        return res.status(200).json({data: posts});
    } catch(error) {
        next(error);
    }
}

module.exports = {
    register,
    getMyPosts
};
