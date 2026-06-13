const { query, withTransaction } = require('./config/database');

async function getUserByEmail(email) {
    const users = await query(
        `SELECT id, email, password, status, created_at, update_at, last_login
         FROM users
         WHERE email = ?
         LIMIT 1`,
        [email],
    );

    return users[0] || null;
}

async function _getDefaultRole(connection) {
    const [roles] = await connection.execute(
        'SELECT id, rol FROM roles WHERE rol = ? LIMIT 1',
        ['USER'],
    );

    if (!roles.length) {
        throw new Error('Rol USER no encontrado');
    }

    return roles[0];
}

async function createUser(data) {
    const now = new Date();

    return withTransaction(async (connection) => {
        const [insertUserResult] = await connection.execute(
            `INSERT INTO users (email, password, status, created_at, update_at)
             VALUES (?, ?, ?, ?, ?)`,
            [data.email, data.hashedPassword, 'ACTIVE', now, now],
        );

        const userId = insertUserResult.insertId;
        const defaultRole = await _getDefaultRole(connection);

        await connection.execute(
            'INSERT INTO users_roles (fk_users_id, fk_roles_id, assigned_at) VALUES (?, ?, ?)',
            [userId, defaultRole.id, now],
        );

        await connection.execute(
            `INSERT INTO profiles
             (username, name, surname, phone, country, city, postal_code, biography, created_at, fk_usuarios_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.email.split('@')[0],
                data.name || null,
                data.surname || null,
                data.phone || null,
                data.country || '',
                data.city || '',
                data.postal_code || '',
                data.biography || null,
                now,
                userId,
            ],
        );

        return {
            id: userId,
            email: data.email,
            rol: defaultRole.rol,
            status: 'ACTIVE',
            created_at: now,
            last_login: null,
        };
    });
}

module.exports = {
    getUserByEmail,
    createUser,
};
