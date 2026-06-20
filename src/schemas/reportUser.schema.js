const yup = require('yup');

const reportUserParamsSchema = yup.object({
    userId: yup.number().integer().positive().required(),
});

const reportReasonBodySchema = yup.object({
    reason: yup
        .string()
        .trim()
        .min(10, 'El motivo debe tener al menos 10 caracteres')
        .max(1000)
        .required('El motivo es obligatorio'),
});

module.exports = {
    reportUserParamsSchema,
    reportReasonBodySchema,
};
