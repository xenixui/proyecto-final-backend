const yup = require('yup');

const getProfileByUserSchema = yup.object({
    userId: yup
        .number()
        .typeError('El id de usuario debe ser un número válido')
        .required('El id de usuario es obligatorio')
        .integer('El id de usuario debe ser un número entero'),
});

const updateProfileBodySchema = yup.object({
    username: yup.string().trim().min(3).max(50).required('El username es obligatorio'),
    name: yup.string().trim().max(50).nullable(),
    surname: yup.string().trim().max(50).nullable(),
    photo_url: yup.string().url('Debe ser una URL válida').nullable(),
    phone: yup.string().trim().max(15).nullable(),
    country: yup.string().trim().max(50).required('El país es obligatorio'),
    city: yup.string().trim().max(50).required('La ciudad es obligatoria'),
    postal_code: yup.string().trim().max(15).required('El código postal es obligatorio'),
    biography: yup.string().trim().max(2000).nullable(),
});

module.exports = {
    getProfileByUserSchema,
    updateProfileBodySchema,
};
