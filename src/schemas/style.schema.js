const yup = require('yup');

const styleIdParamSchema = yup.object({
    id: yup
        .number()
        .typeError('El id del estilo debe ser un número válido')
        .required('El id del estilo es obligatorio')
        .integer('El id del estilo debe ser un número entero')
        .positive('El id del estilo debe ser un número positivo'),
});

const styleSearchParamSchema = yup.object({
    term: yup
        .string()
        .required('El término de búsqueda es obligatorio')
        .trim()
        .min(1, 'El término de búsqueda es obligatorio')
        .max(50, 'El término de búsqueda no puede superar los 50 caracteres'),
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
    styleSearchParamSchema,
    createStyleSchema,
    updateStyleSchema,
};
