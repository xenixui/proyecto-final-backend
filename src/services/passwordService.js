const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendResetPasswordEmail } = require('../utils/email');
const { hashPassword } = require('../utils/password');
require('dotenv').config();

const requestPasswordReset = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (user) {
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_RESET_SECRET,
      { expiresIn: '15m' }
    );
    await sendResetPasswordEmail(user.email, token);
  }
  // Siempre responde igual, aunque el usuario no exista
  return {
    message: 'Si ese email está registrado, recibirás un enlace en breve.'
  };
};

const resetPassword = async (token, newPassword) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) throw new Error('Usuario no encontrado');
    user.password = hashPassword(newPassword);
    await user.save();
    return { message: 'Contraseña actualizada correctamente.' };
  } catch (err) {
    throw new Error('Token inválido o expirado');
  }
};

module.exports = {
  requestPasswordReset,
  resetPassword
};
