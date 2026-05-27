const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendResetPasswordEmail = async (to, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Recupera tu contraseña',
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
    });
    console.log(`Email de recuperación enviado a: ${to}`);
  } catch (error) {
    console.error('Error enviando email de recuperación:', error);
    throw new Error('No se pudo enviar el email de recuperación. Revisa la configuración.');
  }
};

module.exports = { sendResetPasswordEmail };
