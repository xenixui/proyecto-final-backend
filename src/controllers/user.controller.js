const userModel = require('../models/user.model');
const { hashPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

async function register(req, res) {
    try {
        const { email, password } = req.body;

        const isExistingUser = await userModel.getUserByEmail(email);
        if (isExistingUser) {
            return res.status(409).json('Ya existe un usuario con ese email');
        }

        const user = await userModel.createUser({
            email,
            hashedPassword: hashPassword(password),
        });

        const token = signToken({
            id: user.id,
            email: user.email,
            rol: user.rol,
        });

        return res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                rol: user.rol || 'USER',
                status: user.status,
                created_at: user.created_at,
                last_login: user.last_login,
            },
        });
    } catch (error) {

        return res.status(500).json({
            message: error.message,
            stack: error.stack
        });
    }
}

module.exports = {
    register,
};
