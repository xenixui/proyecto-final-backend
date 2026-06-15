const yup = require('yup');

const registerUserSchema = yup.object({
    email: yup
        .string()
        .required('Email y contraseña son obligatorios')
        .trim()
        .lowercase()
        .email('El formato del email no es válido'),
    password: yup
        .string()
        .required('Email y contraseña son obligatorios')
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

module.exports = {
    registerUserSchema,
};
