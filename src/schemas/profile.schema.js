const yup = require('yup');

const getProfileByUserSchema = yup.object({
    userId: yup
        .number()
        .typeError('El id de usuario debe ser un número válido')
        .required('El id de usuario es obligatorio')
        .integer('El id de usuario debe ser un número entero'),
});

const registerUserByAdminSchema = yup.object({
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
    name: yup
        .string()
        .required('El nombre es obligatorio'),
    username: yup 
        .string()
        .required('El username es obligatorio'),
    rol: yup    
        .string()
        .required('El rol es obligatorio')
        .oneOf(['user', 'moderator', 'administrator'], 'El rol no es válido')

});


module.exports = {
    getProfileByUserSchema,
    registerUserByAdminSchema
};
