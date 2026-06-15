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

async function getPostsByUserId(userId) {
    const rows = await query(
        `
        SELECT
        a.id,
        a.title,  
        a.price,
        a.condition,
        a.status,
        a.year_of_manufacture,
        a.original_box,
        a.original_papers,
        a.shipping_available,
        a.published_at,
        b.name  AS brand_name,
        m.name  AS model_name,
        m.reference AS model_reference,
        img.image_url AS cover_image
        FROM articles a
        INNER JOIN models  m   ON a.fk_models_id = m.id
        INNER JOIN brands  b   ON m.fk_brands_id = b.id
        LEFT JOIN articles_images img
               ON img.fk_articles_id = a.id AND img.is_cover = 1
        WHERE a.fk_users_id = ?
          AND a.status NOT IN ('DRAFT', 'RETIRED')
        ORDER BY a.published_at DESC`,
        [userId]
    );
  return rows;
}

module.exports = {
    getUserByEmail,
    createUser,
    getPostsByUserId
};
