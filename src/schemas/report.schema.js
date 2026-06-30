const yup = require('yup');

const validReasons = [
    'fake_item',
    'scam_attempt',
    'suspicious_price',
    'spam',
    'inappropriate_content',
    'other'
];

const validStatuses = ['PENDING', 'UNDER REVIEW', 'RESOLVED', 'REJECTED'];

const createReportSchema = yup.object({
    reason: yup
        .string()
        .typeError('El motivo debe ser una cadena de texto')
        .oneOf(validReasons, 'El motivo seleccionado no es válido')
        .required('El motivo es obligatorio'),

    comments: yup
        .string()
        .typeError('Los comentarios deben ser una cadena de texto')
        .required('Los comentarios son obligatorios')
        .min(10, 'Por favor, introduce al menos 10 caracteres explicando el problema')
        .max(500, 'El comentario no puede superar los 500 caracteres'),

    fk_articles_id: yup
        .number()
        .typeError('fk_articles_id debe ser un número')
        .integer('fk_articles_id debe ser un número entero')
        .positive('fk_articles_id debe ser un número positivo')
        .required('fk_articles_id es obligatorio')
});

const getReportsByStatusQuerySchema = yup.object({
    status: yup
        .string()
        .typeError('El estado debe ser una cadena de texto')
        .oneOf(validStatuses, 'El estado seleccionado no es válido')
        .required('El estado es obligatorio'),
});

module.exports = {
    createReportSchema,
    getReportsByStatusQuerySchema,
};