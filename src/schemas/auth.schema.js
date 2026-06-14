const yup = require('yup');

const loginUserSchema = yup.object({
    email: yup
        .string()
        .required('Email es obligatorio')
        .trim()
        .lowercase(),
    password: yup
        .string()
        .required('La contraseña es obligatoria'),
});

module.exports = {
    loginUserSchema,
};
