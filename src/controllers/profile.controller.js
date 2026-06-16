const profileService = require('../services/profile.service');

async function getProfileByUser(req, res) {
    try {
        const profile = await profileService.getProfileByUserId(
            req.params.userId,
        );

        return res.json(profile);
    } catch (error) {
        return res.status(error.status).json(error.message);
    }
}

module.exports = {
    getProfileByUser,
};
