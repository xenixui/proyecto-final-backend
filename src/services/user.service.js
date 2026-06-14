const userModel = require('../models/user.model');
const { hashPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

async function registerUser(data) {
    const email = data.email;

    const isExistingUser = await userModel.getUserByEmail(email);

    if (isExistingUser) {
        throw _error('Ya existe un usuario con ese email', 409);
    }

    const user = await userModel.createUser({
        email,
        hashedPassword: hashPassword(data.password),
    });

    const token = signToken({
        id: user.id,
        email: user.email,
        rol: user.rol,
    });

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            rol: user.rol || 'USER',
            status: user.status,
            created_at: user.created_at,
            last_login: user.last_login,
        },
    };
}

function _error(message, status) {
    const error = new Error(message);
    error.status = status;
    return error;
}

module.exports = {
    registerUser,
};
