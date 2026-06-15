require('dotenv').config();

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mysql = require('mysql2/promise');


// La idea importante es no gastar llamadas de API para datos ya conocidos:
// una vez una referencia queda guardada en importReferencesProgress.json,
// el script puede reimportarla a la BD todas las veces que haga falta.
const API_URL = 'https://api.thewatchapi.com/v1';
const PROGRESS_FILE = path.join(__dirname, 'importReferencesProgress.json');
const NEW_REFERENCES_LIMIT = 10;

function fixEncoding(value) {
  if (typeof value !== 'string' || !/[ÃÂ]/.test(value)) {
    return value;
  }

  return Buffer.from(value, 'latin1').toString('utf8');
}

// Normaliza strings recibidos desde BD/API/JSON para evitar espacios sobrantes
// y corregir errores de codificacion antes de comparar o insertar.
const normalize = (value) => fixEncoding(String(value || '').trim());

// Clave logica de una referencia.
// En el ER no hay una constraint unica, pero para el importador consideramos
// que una referencia pertenece a una marca y no debe duplicarse dentro de ella.
const refKey = (brand, reference) => `${normalize(brand).toLowerCase()}::${normalize(reference).toLowerCase()}`;

// Carga el progreso local. Si todavia no existe, devuelve una estructura vacia.
// completedModels: referencias reales ya encontradas y listas para importar.
// failedModels: marcas/modelos que dieron error al consultar la API.
function readProgress() {
  const empty = {
    completedModels: [],
    failedModels: [],
    stats: { startedAt: new Date().toISOString() },
  };

  if (!fs.existsSync(PROGRESS_FILE)) {
    return empty;
  }

  return { ...empty, ...JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')) };
}

// Guarda el progreso y recalcula estadisticas simples para seguimiento.
function saveProgress(progress) {
  progress.stats.lastUpdateAt = new Date().toISOString();
  progress.stats.totalSuccess = progress.completedModels.length;
  progress.stats.totalFailed = progress.failedModels.length;
  progress.stats.totalProcessed = progress.stats.totalSuccess + progress.stats.totalFailed;
  fs.writeFileSync(PROGRESS_FILE, `${JSON.stringify(progress, null, 2)}\n`);
}

// Crea la conexion MySQL usando las variables del .env.
// ssl queda habilitado porque la conexion actual lo necesita para el entorno usado.
async function connectDb() {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });
}

// Wrapper de TheWatchAPI.
// Siempre envia api_token y devuelve response.data.data como array.
async function apiGet(endpoint, params) {
  const response = await axios.get(`${API_URL}${endpoint}`, {
    params: { api_token: process.env.THEWATCHAPI_TOKEN, ...params },
    timeout: 30000,
  });

  return Array.isArray(response.data?.data) ? response.data.data : [];
}

// Obtiene las marcas conocidas combinando:
// - marcas ya existentes en MySQL
// - marcas presentes en el JSON de referencias completadas
// - marcas que fallaron previamente
//
// Asi el script puede seguir intentando importar aunque no llame a /brand/list.
async function getBrandNames(connection, progress) {
  const [rows] = await connection.query('SELECT name FROM brands ORDER BY id ASC');
  const names = [
    ...rows.map((row) => row.name),
    ...progress.completedModels.map((model) => model.brandName),
    ...progress.failedModels.map((model) => model.brandName),
  ];

  return [...new Set(names.map(normalize).filter(Boolean))];
}

// Intenta guardar en el JSON una referencia devuelta por TheWatchAPI.
// Devuelve false si faltan datos o si esa marca+referencia ya estaba guardada.
function addToProgress(progress, watch) {
  const brandName = normalize(watch.brand);
  const name = normalize(watch.model);
  const reference = normalize(watch.reference_number);

  if (!brandName || !name || !reference) {
    return false;
  }

  const existing = new Set(progress.completedModels.map((model) => refKey(model.brandName, model.reference)));

  if (existing.has(refKey(brandName, reference))) {
    return false;
  }

  progress.completedModels.push({ name, brandName, reference, found: true });
  return true;
}

// Registra un fallo de API para una marca.
// Esto sirve para saber que la proxima ejecucion debe volver a intentarla.
function rememberFailure(progress, brandName, error) {
  const failed = {
    brandName,
    name: '',
    error: error.message,
    attemptedAt: new Date().toISOString(),
  };

  progress.failedModels = [
    ...progress.failedModels.filter((item) => normalize(item.brandName) !== brandName),
    failed,
  ];
}

// Si la API devuelve 402, se asume limite de cuota y se detiene esta fase.
async function collectTenReferences(progress, connection) {
  if (!process.env.THEWATCHAPI_TOKEN) {
    throw new Error('Falta THEWATCHAPI_TOKEN en el archivo .env');
  }

  const knownRefs = new Set(progress.completedModels.map((model) => refKey(model.brandName, model.reference)));
  const brandNames = await getBrandNames(connection, progress);
  let added = 0;

  for (const brandName of brandNames) {
    if (added >= NEW_REFERENCES_LIMIT) break;

    try {
      const references = await apiGet('/reference/list', { brand: brandName });

      for (const reference of references) {
        if (added >= NEW_REFERENCES_LIMIT) break;
        if (knownRefs.has(refKey(brandName, reference))) continue;

        const watches = await apiGet('/model/search', {
          search: reference,
          search_attributes: 'reference_number',
          brand: brandName,
          reference_number: reference,
        });

        for (const watch of watches) {
          if (added >= NEW_REFERENCES_LIMIT) break;

          if (addToProgress(progress, watch)) {
            added += 1;
            knownRefs.add(refKey(watch.brand, watch.reference_number));
            console.log(`JSON + ${watch.brand} | ${watch.model} | ${watch.reference_number}`);
          }
        }

        saveProgress(progress);
      }
    } catch (error) {
      rememberFailure(progress, brandName, error);
      saveProgress(progress);
      console.error(`API error ${brandName}: ${error.message}`);

      if (error.response?.status === 402) {
        console.error('Limite de uso de TheWatchAPI alcanzado.');
        break;
      }
    }
  }

  console.log(`Referencias nuevas en JSON: ${added}`);
}

// Busca una marca en BD o la crea si no existe.
// El ER exige country NOT NULL, por eso se usa Unknown cuando la API no lo aporta.
async function findOrCreateBrand(connection, brandName) {
  const [rows] = await connection.query('SELECT id FROM brands WHERE name = ?', [brandName]);

  if (rows.length) {
    return rows[0].id;
  }

  const [result] = await connection.query(
    'INSERT INTO brands (name, country, logo_url) VALUES (?, ?, ?)',
    [brandName, 'Unknown', null]
  );

  return result.insertId;
}

// Usa marca + referencia como clave logica:
// - si existe, actualiza nombre/gender/movement_type
// - si no existe, inserta una fila nueva en models
async function importJsonToDb(progress, connection) {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const model of progress.completedModels) {
    const brandName = normalize(model.brandName);
    const name = normalize(model.name);
    const reference = normalize(model.reference);

    if (!brandName || !name || !reference || reference === 'N/A') {
      skipped += 1;
      continue;
    }

    const brandId = await findOrCreateBrand(connection, brandName);
    const [rows] = await connection.query(
      'SELECT id FROM models WHERE fk_brands_id = ? AND reference = ?',
      [brandId, reference]
    );

    if (rows.length) {
      await connection.query(
        'UPDATE models SET name = ?, gender = ?, movement_type = ? WHERE id = ?',
        [name, 'UNISEX', 'AUTOMATIC', rows[0].id]
      );
      updated += 1;
    } else {
      await connection.query(
        'INSERT INTO models (name, reference, gender, movement_type, fk_brands_id) VALUES (?, ?, ?, ?, ?)',
        [name, reference, 'UNISEX', 'AUTOMATIC', brandId]
      );
      created += 1;
    }
  }

  console.log(`BD creados: ${created}`);
  console.log(`BD actualizados: ${updated}`);
  console.log(`BD omitidos: ${skipped}`);
}

// Muestra un resumen simple para comprobar rapidamente si hay referencias reales
// y si quedan filas antiguas con reference = 'N/A'.
async function printSummary(connection) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) total,
            SUM(reference = 'N/A') pendingReferences,
            SUM(reference <> 'N/A') realReferences
     FROM models`
  );
  console.log('Resumen BD:', rows[0]);
}

async function run() {
  const progress = readProgress();
  const connection = await connectDb();

  try {
    await collectTenReferences(progress, connection);
    await importJsonToDb(progress, connection);
    await printSummary(connection);
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  console.error(`Error en importacion: ${error.message}`);
  process.exitCode = 1;
});
