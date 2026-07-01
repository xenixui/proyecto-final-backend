const yup = require('yup');

const validReasons = [
    'fake_item',
    'scam_attempt',
    'suspicious_price',
    'spam',
    'inappropriate_content',
    'other',
];

const validStatuses = ['PENDING', 'UNDER REVIEW', 'RESOLVED', 'REJECTED'];

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function normalizeDateBoundary(value, boundary) {
    if (ISO_DATE_ONLY.test(value)) {
        const suffix =
            boundary === 'start' ? 'T00:00:00.000Z' : 'T23:59:59.999Z';
        return new Date(`${value}${suffix}`);
    }

    return new Date(value);
}

function isValidDateValue(value) {
    if (!value) {
        return true;
    }

    const parsed = normalizeDateBoundary(
        value,
        value.length === 10 ? 'start' : 'end',
    );
    return !Number.isNaN(parsed.getTime());
}

const reportCreatedFromQuerySchema = yup
    .string()
    .transform((_, originalValue) =>
        originalValue === '' || originalValue == null
            ? undefined
            : String(originalValue).trim(),
    )
    .test(
        'is-valid-date',
        'El formato de created_from no es válido',
        isValidDateValue,
    )
    .transform((value) => {
        if (!value) {
            return undefined;
        }

        return normalizeDateBoundary(value, 'start');
    })
    .optional();

const reportCreatedToQuerySchema = yup
    .string()
    .transform((_, originalValue) =>
        originalValue === '' || originalValue == null
            ? undefined
            : String(originalValue).trim(),
    )
    .test(
        'is-valid-date',
        'El formato de created_to no es válido',
        isValidDateValue,
    )
    .transform((value) => {
        if (!value) {
            return undefined;
        }

        return normalizeDateBoundary(value, 'end');
    })
    .optional();

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
        .min(
            10,
            'Por favor, introduce al menos 10 caracteres explicando el problema',
        )
        .max(500, 'El comentario no puede superar los 500 caracteres'),

    fk_articles_id: yup
        .number()
        .typeError('fk_articles_id debe ser un número')
        .integer('fk_articles_id debe ser un número entero')
        .positive('fk_articles_id debe ser un número positivo')
        .required('fk_articles_id es obligatorio'),
});

const reportPageQuerySchema = yup
    .number()
    .transform((_, originalValue) =>
        originalValue === '' || originalValue == null
            ? undefined
            : Number(originalValue),
    )
    .typeError('page debe ser un número')
    .integer('page debe ser un número entero')
    .positive('page debe ser un número positivo')
    .optional();

const reportLimitQuerySchema = yup
    .number()
    .transform((_, originalValue) =>
        originalValue === '' || originalValue == null
            ? undefined
            : Number(originalValue),
    )
    .typeError('limit debe ser un número')
    .integer('limit debe ser un número entero')
    .positive('limit debe ser un número positivo')
    .max(100, 'limit no puede superar 100')
    .optional();

const getReportsByStatusQuerySchema = yup
    .object({
        status: yup
            .string()
            .trim()
            .oneOf(validStatuses, 'El estado seleccionado no es válido')
            .optional(),
        reason: yup
            .string()
            .trim()
            .oneOf(validReasons, 'El motivo seleccionado no es válido')
            .optional(),
        search: yup
            .string()
            .transform((value) => {
                if (value == null) {
                    return undefined;
                }

                const trimmed = String(value).trim();
                return trimmed === '' ? undefined : trimmed;
            })
            .optional(),
        created_from: reportCreatedFromQuerySchema,
        created_to: reportCreatedToQuerySchema,
        page: reportPageQuerySchema,
        limit: reportLimitQuerySchema,
    })
    .test(
        'date-range',
        'created_from no puede ser posterior a created_to',
        function validateDateRange(values) {
            const { created_from, created_to } = values;
            if (!created_from || !created_to) {
                return true;
            }

            return created_from <= created_to;
        },
    );

const reportIdParamSchema = yup.object({
    id: yup
        .number()
        .typeError('El id del reporte debe ser un número')
        .required('El id del reporte es obligatorio'),
});

module.exports = {
    createReportSchema,
    getReportsByStatusQuerySchema,
    reportIdParamSchema,
};
