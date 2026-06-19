const yup = require('yup');

const styleIdParamSchema = yup.object({
    id: yup
        .number()
        .typeError('El id del estilo debe ser un número válido')
        .required('El id del estilo es obligatorio')
        .integer('El id del estilo debe ser un número entero')
        .positive('El id del estilo debe ser un número positivo'),
});

const createStyleSchema = yup.object({
    name: yup
        .string()
        .required('El nombre es obligatorio')
        .trim()
        .max(50, 'El nombre no puede superar los 50 caracteres'),
    description: yup
        .string()
        .trim()
        .max(255, 'La descripción no puede superar los 255 caracteres')
        .nullable()
        .default(null),
});

const updateStyleSchema = createStyleSchema;

module.exports = {
    styleIdParamSchema,
    createStyleSchema,
    updateStyleSchema,
};
