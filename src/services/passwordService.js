const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { sendResetPasswordEmail } = require('../utils/email');
const { hashPassword } = require('../utils/password');
require('dotenv').config();

const requestPasswordReset = async (email) => {
  const users = await query(
    'SELECT id, email FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  const user = users[0];

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

    const users = await query('SELECT id FROM users WHERE id = ? LIMIT 1', [decoded.id]);
    if (!users.length) throw new Error('Usuario no encontrado');

    await query(
      'UPDATE users SET password = ?, update_at = ? WHERE id = ?',
      [hashPassword(newPassword), new Date(), decoded.id]
    );

    return { message: 'Contraseña actualizada correctamente.' };
  } catch (err) {
    throw new Error('Token inválido o expirado');
  }
};

module.exports = {
  requestPasswordReset,
  resetPassword
};
