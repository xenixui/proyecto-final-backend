const db = require('../config/database');

async function getAll() {
  return db.query(
    'SELECT id, name, description FROM styles ORDER BY name ASC',
  );
}

async function getById(id) {
  const result = await db.query(
    'SELECT id, name, description FROM styles WHERE id = ?',
    [id],
  );

  return result[0] || null;
}

async function searchByName(term) {
  return db.query(
    'SELECT id, name, description FROM styles WHERE name LIKE ? ORDER BY name ASC',
    [`%${term}%`],
  );
}

async function create({ name, description }) {
  const result = await db.query(
    'INSERT INTO styles (name, description) VALUES (?, ?)',
    [name, description ?? null],
  );

  return getById(result.insertId);
}

async function update(id, { name, description }) {
  await db.query('UPDATE styles SET name = ?, description = ? WHERE id = ?', [
    name,
    description ?? null,
    id,
  ]);

  return getById(id);
}

async function remove(id) {
  await db.query('DELETE FROM styles WHERE id = ?', [id]);
}

module.exports = {
  getAll,
  getById,
  searchByName,
  create,
  update,
  remove,
};
