const yup = require('yup');

const getProfileByUserSchema = yup.object({
    userId: yup
        .number()
        .typeError('El id de usuario debe ser un número válido')
        .required('El id de usuario es obligatorio')
        .integer('El id de usuario debe ser un número entero'),
});

module.exports = {
    getProfileByUserSchema,
};
