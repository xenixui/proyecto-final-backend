const yup = require('yup');

const createReviewSchema = yup.object({
    article_id: yup
        .number()
        .typeError('El artículo es obligatorio')
        .integer('El artículo no es válido')
        .positive('El artículo no es válido')
        .required('El artículo es obligatorio'),
    stars: yup
        .number()
        .typeError('La valoración debe ser un número')
        .integer('La valoración debe ser un número entero')
        .min(1, 'La valoración mínima es 1')
        .max(5, 'La valoración máxima es 5')
        .required('La valoración es obligatoria'),
    comentario: yup
        .string()
        .trim()
        .max(500, 'El comentario no puede superar los 500 caracteres')
        .nullable()
        .default(null),
});

module.exports = {
    createReviewSchema,
};