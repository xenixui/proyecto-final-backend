const userModel = require('../models/user.model');
const { hashPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function registerUser(data) {
    _validateRegistrationData(data);

    const email = data.email.trim().toLowerCase();

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

function _validateRegistrationData(data) {
    const { email, password } = data;

    if (!email || !password) {
        throw _error('Email y contraseña son obligatorios', 400);
    }

    if (!EMAIL_REGEX.test(email)) {
        throw _error('El formato del email no es válido', 400);
    }

    if (password.length < 6) {
        throw _error(
            'La contraseña debe tener al menos 6 caracteres',
            400,
        );
    }
}

function _error(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

module.exports = {
    registerUser,
};
