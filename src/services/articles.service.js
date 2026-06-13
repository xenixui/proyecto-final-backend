const articlesModel = require('../models/articles.model');

const VALID_STATUSES = [
    'DRAFT',
    'PUBLISHED',
    'UNDER_REVIEW',
    'SOLD',
    'RESERVED',
    'RETIRED',
];

async function searchArticles(queryParams) {
    const filters = _normalizeFilters(queryParams);
    const articles = await articlesModel.searchArticles(filters);

    return {
        count: articles.length,
        articles,
    };
}

function _normalizeFilters(queryParams) {
    const filters = {};

    if (queryParams.status !== undefined && queryParams.status !== '') {
        const status = String(queryParams.status).trim().toUpperCase();

        if (!VALID_STATUSES.includes(status)) {
            throw _error(
                `Estado no válido. Valores permitidos: ${VALID_STATUSES.join(', ')}`,
                400,
            );
        }

        filters.status = status;
    } else {
        filters.status = 'PUBLISHED';
    }

    if (queryParams.categoryId !== undefined && queryParams.categoryId !== '') {
        const categoryId = Number(queryParams.categoryId);

        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            throw _error('categoryId debe ser un entero positivo', 400);
        }

        filters.categoryId = categoryId;
    }

    if (queryParams.category !== undefined && queryParams.category !== '') {
        const category = String(queryParams.category).trim();

        if (!category) {
            throw _error('category no puede estar vacío', 400);
        }

        filters.category = category;
    }

    if (queryParams.minPrice !== undefined && queryParams.minPrice !== '') {
        const minPrice = Number(queryParams.minPrice);

        if (Number.isNaN(minPrice) || minPrice < 0) {
            throw _error('minPrice debe ser un número positivo', 400);
        }

        filters.minPrice = minPrice;
    }

    if (queryParams.maxPrice !== undefined && queryParams.maxPrice !== '') {
        const maxPrice = Number(queryParams.maxPrice);

        if (Number.isNaN(maxPrice) || maxPrice < 0) {
            throw _error('maxPrice debe ser un número positivo', 400);
        }

        filters.maxPrice = maxPrice;
    }

    if (
        filters.minPrice !== undefined &&
        filters.maxPrice !== undefined &&
        filters.minPrice > filters.maxPrice
    ) {
        throw _error('minPrice no puede ser mayor que maxPrice', 400);
    }

    if (queryParams.city !== undefined && queryParams.city !== '') {
        const city = String(queryParams.city).trim();

        if (!city) {
            throw _error('city no puede estar vacío', 400);
        }

        filters.city = city;
    }

    if (queryParams.country !== undefined && queryParams.country !== '') {
        const country = String(queryParams.country).trim();

        if (!country) {
            throw _error('country no puede estar vacío', 400);
        }

        filters.country = country;
    }

    if (queryParams.postalCode !== undefined && queryParams.postalCode !== '') {
        const postalCode = String(queryParams.postalCode).trim();

        if (!postalCode) {
            throw _error('postalCode no puede estar vacío', 400);
        }

        filters.postalCode = postalCode;
    }

    return filters;
}

function _error(message, status) {
    const error = new Error(message);
    error.status = status;
    return error;
}

module.exports = {
    searchArticles,
};
