const { query, withTransaction } = require('../config/database');

async function getUserByEmail(email) {
    const result = await query(
        `SELECT id, email, password, status, created_at, update_at, last_login
         FROM users
         WHERE email = ?
         LIMIT 1`,
        [email],
    );

    return result[0] || null;
}

async function _getDefaultRole(connection) {
    const [result] = await connection.execute(
        'SELECT id, rol FROM roles WHERE rol = ? LIMIT 1',
        ['USER'],
    );

    if (!result.length) {
        throw new Error('Rol USER no encontrado');
    }

    return result[0];
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
            `INSERT INTO profiles (username, created_at, fk_usuarios_id)
             VALUES (?, ?, ?)`,
            [data.email.split('@')[0], now, userId],
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

async function countActive() {
    const result = await query(
        "SELECT COUNT(*) AS total FROM users WHERE status = 'ACTIVE'",
    );

    return result[0].total;
}


async function countByStatus(periodo) {
    let whereClause = '';
    
    if(periodo === '7d') {
        whereClause = `WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
    } else if (periodo === '30d') {
        whereClause = `WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
    } else if (periodo === 'today') {
        whereClause = `WHERE DATE(created_at) = CURDATE()`;
    }
    
    const result = await query(`
        SELECT status, COUNT(*) AS total    
        FROM users
        ${whereClause}
        GROUP BY status
    `);
    return result;
}

async function getSessionByDate(periodo) {
    let whereClause = `WHERE last_login IS NOT NULL`;
    if(periodo === '7d') {
        whereClause += ` AND last_login >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
    }else if (periodo === '30d') {
        whereClause += ` AND last_login >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
    } else if (periodo === 'today') {
        whereClause += ` AND DATE(last_login) = CURDATE()`;
    } 

    const result = await query(`
        SELECT DATE(last_login) AS date, COUNT(*) AS total
        FROM users
        ${whereClause}
        GROUP BY DATE(last_login)
        ORDER BY DATE(last_login) ASC
    `);
    return result;
}

module.exports = {
    getUserByEmail,
    createUser,
    countActive,
    countByStatus,
    getSessionByDate,
};
