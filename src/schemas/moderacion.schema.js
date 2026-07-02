const yup = require('yup');

const resolveReportSchema = yup.object({
    resolution: yup
        .string()
        .required('El campo resolution es obligatorio')
        .oneOf(
            ['APPROVED', 'RETIRED'],
            'La resolución debe ser APPROVED o RETIRED',
        ),
    moderator_note: yup.string().optional(),
});

const rejectReportSchema = yup.object({
    moderator_note: yup.string().optional(),
});

const retireArticleSchema = yup.object({
    reportId: yup
        .number()
        .typeError('reportId debe ser un número')
        .required('reportId es obligatorio'),
});

module.exports = {
    resolveReportSchema,
    rejectReportSchema,
    retireArticleSchema,
};
