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
    const filters = _validateFilters(queryParams);
    const articles = await articlesModel.searchArticles(filters);

    return {
        articles
    };
}

function _validateFilters(queryParams) {
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
    }

    if (queryParams.styleId !== undefined && queryParams.styleId !== '') {
        const styleId = Number(queryParams.styleId);

        filters.styleId = styleId;
    }

    if (queryParams.category !== undefined && queryParams.category !== '') {
        const category = String(queryParams.category).trim();

        filters.category = category;
    }

    if (queryParams.minPrice !== undefined && queryParams.minPrice !== '') {
        const minPrice = Number(queryParams.minPrice);

        filters.minPrice = minPrice;
    }

    if (queryParams.maxPrice !== undefined && queryParams.maxPrice !== '') {
        const maxPrice = Number(queryParams.maxPrice);

        filters.maxPrice = maxPrice;
    }

    if (queryParams.city !== undefined && queryParams.city !== '') {
        const city = String(queryParams.city).trim();

        filters.city = city;
    }

    if (queryParams.country !== undefined && queryParams.country !== '') {
        const country = String(queryParams.country).trim();

        filters.country = country;
    }

    if (queryParams.postalCode !== undefined && queryParams.postalCode !== '') {
        const postalCode = String(queryParams.postalCode).trim();

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
