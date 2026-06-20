const profileModel = require ('../models/profiles.model');
const { hashPassword } = require('../utils/password');
const userModel = require('../models/user.model');

async function getProfileDetail(userId) {
    const user = await profileModel.getUserBasicData(userId)

    if (!user) return null

    const purchases = await profileModel.getPurchasesByUser(userId) || [];
    const sales = await profileModel.getSalesByUser(userId) || [];
    const reviews = await profileModel.getReviewsByUser(userId, userId) || [];
    const reports = await profileModel.getReportsByUser(userId) || [];
    const favorites = await profileModel.getFavoritesByUser(userId) || [];

    return {
        user,
        purchases,
        sales,
        reviews,
        reports,
        favorites
    }

};

async function createUserAsAdmin(data) {
    const userExist = await userModel.getUserByEmail(data.email);
    if (userExist) {
        const error = new Error('Ya existe un usuario con ese email');
        error.status = 409;
        throw error;
    }

    const newUser = await profileModel.createUserByAdmin({
        email: data.email,
        hashedPassword: hashPassword(data.password),
        name: data.name,
        username: data.username,
        rol: data.rol
    });

    return {
        id: newUser.id,
        message: 'Nuevo usuario creado'
    };
}

module.exports = {
    getProfileDetail,
    createUserAsAdmin
} 