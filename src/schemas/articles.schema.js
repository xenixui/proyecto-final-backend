const yup = require('yup');

const createArticleSchema = yup.object({
    title: yup
        .string()
        .trim()
        .required('El título es obligatorio')
        .max(100, 'El título no puede superar los 100 caracteres'),

    description: yup
        .string()
        .trim()
        .nullable()
        .notRequired(),

    price: yup
        .number()
        .typeError('El precio debe ser un número válido')
        .required('El precio es obligatorio')
        .positive('El precio debe ser mayor que 0'),

    condition: yup
        .string()
        .oneOf(
            ['NEW', 'VERY_GOOD', 'GOOD', 'USED'],
            'El estado de conservación no es válido',
        )
        .required('El estado de conservación es obligatorio'),

    year_of_manufacture: yup
        .number()
        .typeError('El año de fabricación debe ser un número válido')
        .integer('El año de fabricación debe ser un número entero')
        .required('El año de fabricación es obligatorio')
        .min(1900, 'El año de fabricación no es válido')
        .max(new Date().getFullYear(), 'El año de fabricación no puede ser futuro'),

    case_material: yup.string().trim().nullable().notRequired(),

    bracelet_material: yup.string().trim().nullable().notRequired(),

    original_box: yup
        .boolean()
        .typeError('original_box debe ser true o false')
        .required('Debes indicar si conserva la caja original'),

    original_papers: yup
        .boolean()
        .typeError('original_papers debe ser true o false')
        .required('Debes indicar si conserva los papeles originales'),

    shipping_available: yup
        .boolean()
        .typeError('shipping_available debe ser true o false')
        .required('Debes indicar si el envío está disponible'),

    fk_styles_id: yup
        .number()
        .typeError('El estilo seleccionado no es válido')
        .integer()
        .required('El estilo es obligatorio'),

    fk_models_id: yup
        .number()
        .typeError('El modelo seleccionado no es válido')
        .integer()
        .required('El modelo es obligatorio'),

    // Si el usuario quiere guardarlo como borrador en vez de publicarlo directamente
    publish: yup.boolean().default(true).notRequired(),

});

const updateArticleSchema = yup.object({
    title: yup
        .string()
        .trim()
        .required('El título no puede estar vacío')
        .max(100, 'El título no puede superar los 100 caracteres'),

    description: yup.string().trim().nullable().notRequired(),

    price: yup
        .number()
        .typeError('El precio debe ser un número válido')
        .required('El precio no puede estar vacío')
        .positive('El precio debe ser mayor que 0'),

    condition: yup
        .string()
        .oneOf(
            ['NEW', 'VERY_GOOD', 'GOOD', 'USED'],
            'El estado de conservación no es válido',
        )
        .required('El estado de conservación no puede estar vacío'),

    year_of_manufacture: yup
        .number()
        .typeError('El año de fabricación debe ser un número válido')
        .integer('El año de fabricación debe ser un número entero')
        .required('El año de fabricación no puede estar vacío')
        .min(1900, 'El año de fabricación no es válido')
        .max(new Date().getFullYear(), 'El año de fabricación no puede ser futuro'),

    case_material: yup.string().trim().nullable().notRequired(),

    bracelet_material: yup.string().trim().nullable().notRequired(),

    original_box: yup
        .boolean()
        .typeError('original_box debe ser true o false')
        .required('Debes indicar si conserva la caja original'),

    original_papers: yup
        .boolean()
        .typeError('original_papers debe ser true o false')
        .required('Debes indicar si conserva los papeles originales'),

    shipping_available: yup
        .boolean()
        .typeError('shipping_available debe ser true o false')
        .required('Debes indicar si el envío está disponible'),

    fk_styles_id: yup
        .number()
        .typeError('El estilo seleccionado no es válido')
        .integer()
        .required('El estilo no puede estar vacío'),

    fk_models_id: yup
        .number()
        .typeError('El modelo seleccionado no es válido')
        .integer()
        .required('El modelo no puede estar vacío'),

});

module.exports = {
    createArticleSchema,
    updateArticleSchema
};
