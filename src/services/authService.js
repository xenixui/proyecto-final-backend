const sequelize = require('../config/database');
const { User, Profile, Role } = require('../models');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    rol: user.rol,
    status: user.status,
    created_at: user.created_at,
    last_login: user.last_login,
  };
}

async function registerUser(data) {
  const { email, password } = data;

  if (!email || !password) {
    const error = new Error('Email y contraseña son obligatorios');
    error.status = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('La contraseña debe tener al menos 6 caracteres');
    error.status = 400;
    throw error;
  }

  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    const error = new Error('Ya existe un usuario con ese email');
    error.status = 409;
    throw error;
  }

  const now = new Date();

  return sequelize.transaction(async (transaction) => {
    const user = await User.create(
      {
        email,
        password: hashPassword(password),
        rol: 'USER',
        status: 'ACTIVE',
        created_at: now,
        update_at: now,
      },
      { transaction }
    );

    await Profile.create(
      {
        username: data.username || email.split('@')[0],
        name: data.name || null,
        surname: data.surname || null,
        phone: data.phone || null,
        country: data.country || '',
        city: data.city || '',
        postal_code: data.postal_code || '',
        biography: data.biography || null,
        created_at: now,
        fk_usuarios_id: user.id,
      },
      { transaction }
    );

    const role = await Role.findOne({
      where: { name: 'USER' },
      transaction,
    });

    if (role) {
      await user.addRole(role, { transaction });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      rol: user.rol,
    });

    return {
      token,
      user: publicUser(user),
    };
  });
}

async function loginUser(email, password) {
  if (!email || !password) {
    const error = new Error('Email y contraseña son obligatorios');
    error.status = 400;
    throw error;
  }

  const user = await User.findOne({ where: { email } });

  if (!user || !verifyPassword(password, user.password)) {
    const error = new Error('Credenciales incorrectas');
    error.status = 401;
    throw error;
  }

  if (user.status !== 'ACTIVE') {
    const error = new Error('Usuario no activo');
    error.status = 403;
    throw error;
  }

  user.last_login = new Date();
  user.update_at = new Date();

  await user.save();

  const token = signToken({
    id: user.id,
    email: user.email,
    rol: user.rol,
  });

  return {
    token,
    user: publicUser(user),
  };
}

async function getAuthenticatedUser(userId) {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
    include: [
      { model: Profile, as: 'profile' },
      { model: Role, as: 'roles', through: { attributes: [] } },
    ],
  });

  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    throw error;
  }

  return user;
}

async function changePassword(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    const error = new Error('La contraseña actual y la nueva son obligatorias');
    error.status = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error('La nueva contraseña debe tener al menos 6 caracteres');
    error.status = 400;
    throw error;
  }

  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    throw error;
  }

  const validPassword = verifyPassword(currentPassword, user.password);

  if (!validPassword) {
    const error = new Error('Contraseña actual incorrecta');
    error.status = 401;
    throw error;
  }

  user.password = hashPassword(newPassword);
  user.update_at = new Date();

  await user.save();

  return {
    message: 'Contraseña actualizada correctamente',
  };
}

module.exports = {
  registerUser,
  loginUser,
  getAuthenticatedUser,
  changePassword,
};