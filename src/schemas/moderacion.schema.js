const yup = require('yup');

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
    rejectReportSchema,
    retireArticleSchema,
};
