const yup = require('yup');

const emailSchema = yup
  .string()
  .trim()
  .lowercase()
  .email('El formato del email no es válido')
  .required('El email es obligatorio');

const passwordSchema = yup
  .string()
  .required('La contraseña es obligatoria')
  .min(6, 'La contraseña debe tener al menos 6 caracteres');

const loginSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
});

const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('La contraseña actual es obligatoria'),
  newPassword: passwordSchema,
});

const forgotPasswordSchema = yup.object({
  email: emailSchema,
});

const resetPasswordSchema = yup.object({
  token: yup.string().required('El token es obligatorio'),
  newPassword: passwordSchema,
});

module.exports = {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
