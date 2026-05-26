const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

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

module.exports = {
  register,
  login,
  me,
  logout,
  changePassword,
};