const yup = require('yup');

const validReasons = [
    'fake_item',
    'scam_attempt',
    'suspicious_price',
    'spam',
    'inappropriate_content',
    'other',
];

const reportUserParamsSchema = yup.object({
    userId: yup.number().integer().positive().required(),
});

const reportReasonBodySchema = yup.object({
    reason: yup
        .string()
        .typeError('El motivo debe ser una cadena de texto')
        .oneOf(validReasons, 'El motivo seleccionado no es válido')
        .required('El motivo es obligatorio'),

    comments: yup
        .string()
        .typeError('Los comentarios deben ser una cadena de texto')
        .max(500, 'El comentario no puede superar los 500 caracteres')
        .optional(),
});

module.exports = {
    reportUserParamsSchema,
    reportReasonBodySchema,
};
