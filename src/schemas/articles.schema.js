const yup = require('yup');

const VALID_STATUSES = [
    'DRAFT',
    'PUBLISHED',
    'UNDER_REVIEW',
    'SOLD',
    'RESERVED',
    'RETIRED',
];

const articleSearchSchema = yup
    .object({
        status: yup
            .string()
            .transform(emptyToUndefined)
            .trim()
            .uppercase()
            .oneOf(
                VALID_STATUSES,
                `Estado no válido. Valores permitidos: ${VALID_STATUSES.join(', ')}`,
            ),
        categoryId: yup
            .number()
            .transform(emptyToUndefined)
            .typeError('categoryId debe ser un número')
            .positive('categoryId debe ser un número positivo')
            .integer('categoryId debe ser un número entero'),
        category: yup
            .string()
            .transform(emptyToUndefined)
            .trim(),
        minPrice: yup
            .number()
            .transform(emptyToUndefined)
            .typeError('minPrice debe ser un número')
            .min(0, 'minPrice no puede ser negativo'),
        maxPrice: yup
            .number()
            .transform(emptyToUndefined)
            .typeError('maxPrice debe ser un número')
            .min(0, 'maxPrice no puede ser negativo'),
        city: yup
            .string()
            .transform(emptyToUndefined)
            .trim(),
        country: yup
            .string()
            .transform(emptyToUndefined)
            .trim(),
        postalCode: yup
            .string()
            .transform(emptyToUndefined)
            .trim(),
    })
    .test(
        'price-range',
        'minPrice no puede ser mayor que maxPrice',
        validatePriceRange,
    );

function emptyToUndefined(_value, originalValue) {
  if (
    originalValue === "" ||
    originalValue === undefined ||
    originalValue === null
  ) {
    return undefined;
  }
  return _value;
}

function validatePriceRange(value) {
  const { minPrice, maxPrice } = value;

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    return false;
  }

  return true;
}

module.exports = {
    articleSearchSchema,
};
