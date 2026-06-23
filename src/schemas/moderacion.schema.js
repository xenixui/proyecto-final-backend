const yup = require('yup');

const resolveReportSchema = yup.object({
    resolution: yup
        .string()
        .required('El campo resolution es obligatorio')
        .oneOf(['APPROVED', 'RETIRED'], 'La resolución debe ser APPROVED o RETIRED'),
    moderator_note: yup.string().optional(),
});

const rejectReportSchema = yup.object({
    moderator_note: yup.string().optional(),
});

module.exports = {
    resolveReportSchema,
    rejectReportSchema,
};
