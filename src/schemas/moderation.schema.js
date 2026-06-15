const yup = require('yup');

const resolveReportSchema = yup.object({
  decision: yup
    .string()
    .oneOf(['RETIRED', 'APPROVED'], 'La decisión debe ser RETIRED o APPROVED')
    .required('La decisión es obligatoria'),
  moderator_note: yup.string().trim().nullable().optional(),
});

const idParamSchema = yup.object({
  id: yup
    .number()
    .typeError('El ID debe ser un número entero positivo')
    .integer('El ID debe ser un número entero')
    .positive('El ID debe ser un número positivo')
    .required('El ID es obligatorio'),
});

module.exports = { resolveReportSchema, idParamSchema };
