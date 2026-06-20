const { query } = require('../config/database');
const profileModel = require('../models/profiles.model');
const profileService = require('../services/profile.service')

async function getProfileByUser(req, res) {
    try {
        const { userId } = req.params;

        const users = await query('SELECT id FROM users WHERE id = ? LIMIT 1', [
            userId,
        ]);
        if (!users[0]) {
            return res.status(404).json('Usuario no encontrado');
        }

        const profiles = await query(
            `SELECT id, username, rating, photo_url, name, surname, phone, country, city, postal_code, biography, created_at, fk_usuarios_id
             FROM profiles
             WHERE fk_usuarios_id = ?
             LIMIT 1`,
            [userId],
        );

        if (!profiles[0]) {
            return res.status(404).json('Perfil no encontrado');
        }

        return res.json(profiles[0]);
    } catch (error) {
        return res.status(error.status).json(error.message);
    }
}

async function getProfiles(req, res) {
    try {
        const result = await profileModel.getAllProfiles(req.query.rol);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar los perfiles',
            error: error.message
        });
    }
}

async function getProfileDetailById(req, res) {
    try {
        const result = await profileService.getProfileDetail(req.params.id)
        if (!result) {
            return res.status(404).json({
                message: 'No existe un usuario con ese ID'
            })
        }
        return res.json(result)
    } catch (error) {
        console.error('Error en getProfileDetailById:', error)
        return res.status(500).json({
            message: 'Error al recuperar el usuario'
        })
    }
}

async function createUser(req, res) {
    try {
        const result = await profileService.createUserAsAdmin((req.body))
        if (!result) {
            return res.status(404).json({
                message: 'Error al procesar la solicitud del usuario'
            })
        }
        return res.status(201).json(result);
    } catch (error) {
        console.error("ERROR EN CONTROLADOR DE ADMIN:", error);
         console.error('Error en createUser:', error) 
        res.status(500).json({
            message: 'Error al crear o recuperar el usuario'
        })
    }
}


module.exports = {
    getProfileByUser,
    getProfiles,
    getProfileDetailById,
    createUser
};
