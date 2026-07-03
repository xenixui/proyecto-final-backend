const { query } = require('../config/database');
const profileModel = require('../models/profiles.model');
const profileService = require('../services/profile.service');
const cloudinaryService = require('../services/cloudinary.service');

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

        const stats = await profileModel.getPublicStatsByUser(userId);

        return res.json({
            ...profiles[0],
            rating: stats.rating,
            stats: {
                sales_count: stats.sales_count,
                purchases_count: stats.purchases_count,
                reviews_count: stats.reviews_count,
                member_since: profiles[0].created_at
                    ? new Date(profiles[0].created_at).getFullYear()
                    : null,
            },
        });
    } catch (error) {
        return res.status(error.status).json(error.message);
    }
}

async function getProfileActivity(req, res) {
    try {
        const { userId } = req.params;

        const profile = await profileModel.getByUserId(userId);
        if (!profile) {
            return res.status(404).json({
                message: 'Perfil no encontrado',
            });
        }

        const reviews = await profileModel.getPublicReviewsByUser(userId);
        const favorites =
            Number(req.user.id) === Number(userId)
                ? await profileModel.getFavoriteArticlesByUser(userId)
                : [];

        return res.json({
            reviews,
            favorites,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar la actividad del perfil',
            error: error.message,
        });
    }
}
async function getProfiles(req, res) {
    try {
        const { rol } = req.query;

        const result = rol
            ? await profileModel.getProfilesByRole(rol.toLowerCase())
            : await profileModel.getAllProfiles();

        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar los perfiles',
            error: error.message,
        });
    }
}

async function getProfileDetailById(req, res) {
    try {
        const result = await profileService.getProfileDetail(req.params.id);
        if (!result) {
            return res.status(404).json({
                message: 'No existe un usuario con ese ID',
            });
        }
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al recuperar el usuario',
        });
    }
}

// Dar de alta
async function createUser(req, res) {
    try {
        const result = await profileService.createUserAsAdmin(req.body);

        if (!result) {
            return res.status(404).json({
                message: 'Error al procesar la solicitud del usuario',
            });
        }
        return res.status(201).json(result);
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear o recuperar el usuario',
        });
    }
}

// dar de baja
async function deleteUser(req, res) {
    try {
        const { id } = req.params;

        const result = await profileModel.deactivateUser(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message:
                    'No se encontró ningún usuario con ese ID para dar de baja',
            });
        }

        res.json({
            message: 'Usuario dado de baja correctamente',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al dar de baja al usuario',
        });
    }
}

// Bloquear

async function blockedUser(req, res) {
    try {
        const { id } = req.params;
        const result = await profileModel.blockUser(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message:
                    'No se encontró ningún usuario con ese ID para bloquear',
            });
        }
        res.json({
            message: 'Usuario bloqueado correctamente',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al bloquear al usuario',
        });
    }
}

// Desbloquear
async function unblockedUser(req, res) {
    try {
        const { id } = req.params;
        const result = await profileModel.unblockUser(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message:
                    'No se encontró ningún usuario con ese ID para desbloquear',
            });
        }
        res.json({
            message: 'Usuario desbloqueado correctamente',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al desbloquear al usuario',
        });
    }
}

//Asignar rol
async function assignedRole(req, res) {
    try {
        const { id } = req.params;
        const { rol } = req.body;
        const result = await profileModel.assignRole(id, rol);

        if (!result) {
            return res.status(404).json({
                message: 'Rol no encontrado',
            });
        }

        res.status(201).json({
            message: 'Rol asignado correctamente',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al asignar un rol',
        });
    }
}

//Desasignar rol
async function removedRole(req, res) {
    try {
        const { id, roleId } = req.params;

        const result = await profileModel.removeRole(id, roleId);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'No se encontró esa relación de rol para ese usuario',
            });
        }

        res.status(200).json({
            message: 'Rol eliminado correctamente',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al eliminar un rol',
        });
    }
}

//Obtener todos los roles de perfil
async function getUserRoles(req, res) {
    try {
        const { id } = req.params;

        const roles = await query(
            `SELECT ur.fk_roles_id AS roleId, r.rol
            FROM users_roles ur
            JOIN roles r ON ur.fk_roles_id = r.id
            WHERE ur.fk_users_id = ?`,
            [id]
        );

        return res.json({ roles });
    } catch (error) {
        console.error('Error al obtener roles del usuario:', error);
        return res.status(500).json({
            message: 'Error al obtener roles del usuario',
            error: error.message,
        });
    }
}


// PUT /api/profiles  →  actualiza los datos editables del perfil del usuario autenticado
async function updateProfile(req, res, next) {
    try {
        const data = await profileService.updateProfile(req.user.id, req.body);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

// PUT /api/profiles/:userId  →  admin actualiza el perfil de cualquier usuario
async function updateProfileByUserId(req, res, next) {
    try {
        const data = await profileService.updateProfile(
            req.params.userId,
            req.body,
        );
        res.json(data);
    } catch (err) {
        next(err);
    }
}

// ─── Artículos y pedidos ──────────────────────────────────────

// GET /api/profile/articles  →  relojes que el usuario tiene publicados
async function getMyArticles(req, res, next) {
    try {
        const data = await profileService.getMyArticles(req.user.id);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

// GET /api/profile/orders/purchases  →  artículos que el usuario ha comprado (status SOLD)
async function getMyPurchases(req, res, next) {
    try {
        const data = await profileService.getMyPurchases(req.user.id);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

// GET /api/profile/orders/sales  →  artículos del usuario que han sido vendidos
async function getMySales(req, res, next) {
    try {
        const data = await profileService.getMySales(req.user.id);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

// ─── Chats ────────────────────────────────────────────────────

// GET /api/profile/chats  →  todas las conversaciones del usuario (como comprador o vendedor)
async function getMyChats(req, res, next) {
    try {
        const data = await profileService.getMyChats(req.user.id);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

async function uploadPhoto(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'No se ha seleccionado ninguna imagen',
            });
        }

        const result = await cloudinaryService.uploadImage(
            req.file.buffer,
            `profiles/${req.user.id}`,
        );

        await query(
            `UPDATE profiles
             SET photo_url = ?
             WHERE fk_usuarios_id = ?`,
            [result.secure_url, req.user.id],
        );

        return res.status(200).json({
            photo_url: result.secure_url,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al subir la foto de perfil',
            error: error.message,
        });
    }
}

async function deletePhoto(req, res) {
    try {
        const profiles = await query(
            `SELECT photo_url FROM profiles WHERE fk_usuarios_id = ?`,
            [req.user.id],
        );

        if (!profiles[0]?.photo_url) {
            return res.status(404).json({
                message: 'No hay foto de perfil para eliminar',
            });
        }

        await cloudinaryService.deleteImage(profiles[0].photo_url);

        await query(
            `UPDATE profiles SET photo_url = NULL WHERE fk_usuarios_id = ?`,
            [req.user.id],
        );

        return res.status(200).json({
            message: 'Foto de perfil eliminada correctamente',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al eliminar la foto de perfil',
            error: error.message,
        });
    }
}

module.exports = {
    getProfileByUser,
    getProfiles,
    getProfileActivity,
    getProfileDetailById,
    createUser,
    deleteUser,
    blockedUser,
    unblockedUser,
    assignedRole,
    removedRole,
    getUserRoles,
    updateProfile,
    uploadPhoto,
    deletePhoto,
    updateProfileByUserId,
    getMyArticles,
    getMyPurchases,
    getMySales,
    getMyChats,
};
