const { query, withTransaction } = require('../config/database');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    rol: user.rol || 'USER',
    status: user.status,
    created_at: user.created_at,
    last_login: user.last_login,
  };
}

async function getUserByEmail(email) {
  try {
    const users = await query(
      `SELECT id, email, password, rol, status, created_at, last_login
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    return users[0] || null;
  } catch (error) {
    if (error && error.code !== 'ER_BAD_FIELD_ERROR') {
      throw error;
    }

    const users = await query(
      `SELECT id, email, password, status, created_at, last_login
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    if (!users[0]) {
      return null;
    }

    return {
      ...users[0],
      rol: 'USER',
    };
  }
}

async function getUserById(userId) {
  try {
    const users = await query(
      `SELECT id, email, rol, status, created_at, update_at, last_login
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );

    return users[0] || null;
  } catch (error) {
    if (error && error.code !== 'ER_BAD_FIELD_ERROR') {
      throw error;
    }

    const users = await query(
      `SELECT id, email, status, created_at, update_at, last_login
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );

    if (!users[0]) {
      return null;
    }

    return {
      ...users[0],
      rol: 'USER',
    };
  }
}

async function getRolesForUser(userId, connection = null) {
  const execute = async (sql, params) => {
    if (connection) {
      const [rows] = await connection.execute(sql, params);
      return rows;
    }

    return query(sql, params);
  };

  try {
    return await execute(
      `SELECT r.id, r.name
       FROM roles r
       INNER JOIN users_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [userId]
    );
  } catch (error) {
    return execute(
      `SELECT r.id, r.rol AS name
       FROM roles r
       INNER JOIN users_roles ur ON ur.fk_roles_id = r.id
       WHERE ur.fk_users_id = ?`,
      [userId]
    );
  }
}

async function assignDefaultRole(userId, now, connection) {
  try {
    const [roles] = await connection.execute(
      'SELECT id FROM roles WHERE name = ? LIMIT 1',
      ['USER']
    );

    if (!roles.length) {
      return;
    }

    await connection.execute(
      'INSERT INTO users_roles (user_id, role_id, assigned_at) VALUES (?, ?, ?)',
      [userId, roles[0].id, now]
    );
  } catch (error) {
    try {
      const [roles] = await connection.execute(
        'SELECT id FROM roles WHERE rol = ? LIMIT 1',
        ['USER']
      );

      if (!roles.length) {
        return;
      }

      await connection.execute(
        'INSERT INTO users_roles (fk_users_id, fk_roles_id, assigned_at) VALUES (?, ?, ?)',
        [userId, roles[0].id, now]
      );
    } catch (fallbackError) {
      // Si la tabla puente o columnas no existen en este esquema, no bloqueamos el alta.
    }
  }
}

async function resolveUserRole(userId, fallbackRole = 'USER', connection = null) {
  const roles = await getRolesForUser(userId, connection).catch(() => []);

  if (roles.length && roles[0].name) {
    return roles[0].name;
  }

  return fallbackRole;
}

async function registerUser(data) {
  const { email, password } = data;

  if (!email || !password) {
    const error = new Error('Email y contraseña son obligatorios');
    error.status = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('La contraseña debe tener al menos 6 caracteres');
    error.status = 400;
    throw error;
  }

  const existingUsers = await query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  if (existingUsers.length) {
    const error = new Error('Ya existe un usuario con ese email');
    error.status = 409;
    throw error;
  }

  const now = new Date();

  return withTransaction(async (connection) => {
    let insertUserResult;

    try {
      const [result] = await connection.execute(
        `INSERT INTO users (email, password, rol, status, created_at, update_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [email, hashPassword(password), 'USER', 'ACTIVE', now, now]
      );
      insertUserResult = result;
    } catch (error) {
      if (!error || error.code !== 'ER_BAD_FIELD_ERROR') {
        throw error;
      }

      const [result] = await connection.execute(
        `INSERT INTO users (email, password, status, created_at, update_at)
         VALUES (?, ?, ?, ?, ?)`,
        [email, hashPassword(password), 'ACTIVE', now, now]
      );
      insertUserResult = result;
    }

    const userId = insertUserResult.insertId;

    await connection.execute(
      `INSERT INTO profiles
       (username, name, surname, phone, country, city, postal_code, biography, created_at, fk_usuarios_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.username || email.split('@')[0],
        data.name || null,
        data.surname || null,
        data.phone || null,
        data.country || '',
        data.city || '',
        data.postal_code || '',
        data.biography || null,
        now,
        userId,
      ]
    );

    await assignDefaultRole(userId, now, connection);
    const effectiveRole = await resolveUserRole(userId, 'USER', connection);

    const user = {
      id: userId,
      email,
      rol: effectiveRole,
      status: 'ACTIVE',
      created_at: now,
      last_login: null,
    };

    const token = signToken({
      id: userId,
      email,
      rol: effectiveRole,
    });

    return {
      token,
      user: publicUser(user),
    };
  });
}

async function loginUser(email, password) {
  if (!email || !password) {
    const error = new Error('Email y contraseña son obligatorios');
    error.status = 400;
    throw error;
  }

  const user = await getUserByEmail(email);

  if (!user || !verifyPassword(password, user.password)) {
    const error = new Error('Credenciales incorrectas');
    error.status = 401;
    throw error;
  }

  if (user.status !== 'ACTIVE') {
    const error = new Error('Usuario no activo');
    error.status = 403;
    throw error;
  }

  const now = new Date();

  await query(
    'UPDATE users SET last_login = ?, update_at = ? WHERE id = ?',
    [now, now, user.id]
  );

  const effectiveRole = user.rol || await resolveUserRole(user.id, 'USER');

  const token = signToken({
    id: user.id,
    email: user.email,
    rol: effectiveRole,
  });

  return {
    token,
    user: publicUser({ ...user, rol: effectiveRole }),
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
    [userId]
  );

  const roles = await getRolesForUser(userId).catch(() => []);
  const effectiveRole = user.rol || await resolveUserRole(userId, 'USER');

  return {
    ...user,
    rol: effectiveRole,
    profile: profiles[0] || null,
    roles,
  };
}

async function changePassword(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    const error = new Error('La contraseña actual y la nueva son obligatorias');
    error.status = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error('La nueva contraseña debe tener al menos 6 caracteres');
    error.status = 400;
    throw error;
  }

  const users = await query(
    'SELECT id, password FROM users WHERE id = ? LIMIT 1',
    [userId]
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

  await query(
    'UPDATE users SET password = ?, update_at = ? WHERE id = ?',
    [hashPassword(newPassword), new Date(), userId]
  );

  return {
    message: 'Contraseña actualizada correctamente',
  };
}

module.exports = {
  registerUser,
  loginUser,
  getAuthenticatedUser,
  changePassword,
};