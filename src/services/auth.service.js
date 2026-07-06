const { query } = require('../config/database');
const userModel = require('../models/user.model');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

function publicUser(user) {
    return {
        id: user.id,
        email: user.email,
        rol: user.rol || 'user',
        status: user.status,
        created_at: user.created_at,
        last_login: user.last_login,
    };
}

async function getUserById(userId) {
    const users = await query(
        `SELECT id, email, status, created_at, update_at, last_login
     FROM users
     WHERE id = ?
     LIMIT 1`,
        [userId],
    );

    return users[0] || null;
}

async function getRolesForUser(userId) {
    return query(
        `SELECT r.id, r.rol AS name
     FROM roles r
     INNER JOIN users_roles ur ON ur.fk_roles_id = r.id
     WHERE ur.fk_users_id = ?`,
        [userId],
    );
}

const ROLE_PRIORITY = ['admin', 'moderator', 'user'];

async function resolveUserRole(userId, fallbackRole = 'user') {
    const roles = await getRolesForUser(userId).catch(() => []);

    if (!roles.length) {
        return fallbackRole;
    }

    const roleNames = roles.map((r) => r.name);

    const highestRole = ROLE_PRIORITY.find((role) =>
        roleNames.includes(role),
    );

    return highestRole || roleNames[0] || fallbackRole;
}

async function loginUser(email, password) {
    const user = await userModel.getUserByEmail(email);

    if (!user) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
    }

    if (!verifyPassword(password, user.password)) {
        const error = new Error('Contraseña incorrecta');
        error.status = 400;
        throw error;
    }

    if (user.status !== 'ACTIVE') {
        const error = new Error('Usuario inactivo');
        error.status = 403;
        throw error;
    }

    const now = new Date();

    await query('UPDATE users SET last_login = ?, update_at = ? WHERE id = ?', [
        now,
        now,
        user.id,
    ]);

    const effectiveRole = await resolveUserRole(user.id, 'user');

    const token = signToken({
        id: user.id,
        email: user.email,
        rol: effectiveRole,
    });

    return {
        token,
        user: publicUser({ ...user, rol: effectiveRole, last_login: now }),
    };
}

async function getAuthenticatedUser(userId) {
    const user = await getUserById(userId);

    if (!user) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
    }

    const profiles = await query(
        `SELECT id, username, rating, photo_url, name, surname, phone, country, city, postal_code, biography, created_at, fk_usuarios_id
     FROM profiles
     WHERE fk_usuarios_id = ?
     LIMIT 1`,
        [userId],
    );

    const roles = await getRolesForUser(userId).catch(() => []);
    const effectiveRole = await resolveUserRole(userId, 'user');

    return {
        ...user,
        rol: effectiveRole,
        profile: profiles[0] || null,
        roles,
    };
}

async function changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
        const error = new Error(
            'La contraseña actual y la nueva son obligatorias',
        );
        error.status = 400;
        throw error;
    }

    if (newPassword.length < 6) {
        const error = new Error(
            'La nueva contraseña debe tener al menos 6 caracteres',
        );
        error.status = 400;
        throw error;
    }

    const users = await query(
        'SELECT id, password FROM users WHERE id = ? LIMIT 1',
        [userId],
    );

    const user = users[0];

    if (!user) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
    }

    const validPassword = verifyPassword(currentPassword, user.password);

    if (!validPassword) {
        const error = new Error('Contraseña actual incorrecta');
        error.status = 401;
        throw error;
    }

    await query('UPDATE users SET password = ?, update_at = ? WHERE id = ?', [
        hashPassword(newPassword),
        new Date(),
        userId,
    ]);

    return {
        message: 'Contraseña actualizada correctamente',
    };
}

module.exports = {
    loginUser,
    getAuthenticatedUser,
    changePassword,
};
