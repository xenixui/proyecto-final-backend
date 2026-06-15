const authService = require('../services/authService');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getAuthenticatedUser(req.user.id);

    return res.json(user);
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  return res.json({
    message: 'Sesión cerrada. Elimina el token en el cliente.'
  });
}

async function changePassword(req, res, next) {
  try {

    const result = await authService.changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    );

    return res.json(result);

  } catch (error) {
    next(error);

  }
}

// Recuperación de contraseña
const passwordService = require('../services/passwordService');

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const result = await passwordService.requestPasswordReset(email);
    return res.json(result);
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    const result = await passwordService.resetPassword(token, newPassword);
    return res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  me,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
};