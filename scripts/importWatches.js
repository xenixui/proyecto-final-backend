require('dotenv').config();

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sequelize = require('../src/config/database');
const { Brand, WatchModel } = require('../src/models');

const API_BASE_URL = 'https://api.thewatchapi.com/v1';
const API_TOKEN = process.env.THEWATCHAPI_TOKEN;
const PROGRESS_FILE = path.join(__dirname, 'importWatchesProgress.json');
const REFERENCES_PROGRESS_FILE = path.join(__dirname, 'importReferencesProgress.json');
const BATCH_SIZE = 15;
const DELAY_BETWEEN_REQUESTS = 500;
let lastRequestTime = 0;

function loadProgress() {
  if (!fs.existsSync(PROGRESS_FILE)) {
    return {
      completedBrands: [],
      failedBrands: [],
    };
  }

  const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));

  return {
    completedBrands: Array.isArray(progress.completedBrands) ? progress.completedBrands : [],
    failedBrands: Array.isArray(progress.failedBrands) ? progress.failedBrands : [],
  };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, `${JSON.stringify(progress, null, 2)}\n`);
}

function markBrandCompleted(progress, brandName) {
  progress.completedBrands = Array.from(new Set([...progress.completedBrands, brandName])).sort();
  progress.failedBrands = progress.failedBrands.filter((name) => name !== brandName);
  saveProgress(progress);
}

function markBrandFailed(progress, brandName) {
  if (!progress.completedBrands.includes(brandName)) {
    progress.failedBrands = Array.from(new Set([...progress.failedBrands, brandName])).sort();
    saveProgress(progress);
  }
}

function requireApiToken() {
  if (!API_TOKEN) {
    throw new Error('Falta THEWATCHAPI_TOKEN en el archivo .env');
  }
}

async function requestTheWatchApi(path, params = {}) {
  const response = await axios.get(`${API_BASE_URL}${path}`, {
    params: {
      api_token: API_TOKEN,
      ...params,
    },
    timeout: 30000,
  });

  return Array.isArray(response.data?.data) ? response.data.data : [];
}

async function findOrCreateBrand(name) {
  const cleanName = String(name || '').trim();

  if (!cleanName) {
    return { brand: null, created: false };
  }

  const [brand, created] = await Brand.findOrCreate({
    where: { name: cleanName },
    defaults: {
      name: cleanName,
      country: 'Unknown',
      logo_url: null,
    },
  });

  return { brand, created };
}

async function findOrCreateWatchModel(name, brandId) {
  const cleanName = String(name || '').trim();

  if (!cleanName || !brandId) {
    return { model: null, created: false };
  }

  const [model, created] = await WatchModel.findOrCreate({
    where: {
      name: cleanName,
      fk_brands_id: brandId,
    },
    defaults: {
      name: cleanName,
      reference: 'N/A',
      gender: 'UNISEX',
      movement_type: 'AUTOMATIC',
      fk_brands_id: brandId,
    },
  });

  return { model, created };
}

async function importModelsForBrand(brand) {
  const modelNames = await requestTheWatchApi('/model/list', {
    brand: brand.name,
  });

  let insertedModels = 0;
  let existingModels = 0;

  for (const modelName of modelNames) {
    const { created } = await findOrCreateWatchModel(modelName, brand.id);

    if (created) {
      insertedModels += 1;
    } else {
      existingModels += 1;
    }
  }

  return {
    found: modelNames.length,
    inserted: insertedModels,
    existing: existingModels,
  };
}

// ========== FASE 2: Importación de Referencias ==========

function loadReferencesProgress() {
  if (!fs.existsSync(REFERENCES_PROGRESS_FILE)) {
    return {
      completedModels: [],
      failedModels: [],
      stats: {
        startedAt: new Date().toISOString(),
        lastUpdateAt: new Date().toISOString(),
        totalProcessed: 0,
        totalSuccess: 0,
        totalFailed: 0,
      },
    };
  }

  return JSON.parse(fs.readFileSync(REFERENCES_PROGRESS_FILE, 'utf8'));
}

function saveReferencesProgress(progress) {
  progress.stats.lastUpdateAt = new Date().toISOString();
  fs.writeFileSync(REFERENCES_PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function delayRequest() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < DELAY_BETWEEN_REQUESTS) {
    await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS - elapsed));
  }
  lastRequestTime = Date.now();
}

async function searchReferenceForModel(modelName, brandName) {
  try {
    await delayRequest();
    
    const results = await requestTheWatchApi('/model/search', {
      model: modelName,
      brand: brandName,
    });

    if (Array.isArray(results) && results.length > 0) {
      const reference = results[0]?.reference || 'N/A';
      return { reference, found: reference !== 'N/A' };
    }

    return { reference: 'N/A', found: false };
  } catch (error) {
    throw new Error(`Error buscando referencia: ${error.message}`);
  }
}

async function importReferences() {
  requireApiToken();
  await sequelize.authenticate();

  const refProgress = loadReferencesProgress();

  // Obtener IDs de modelos ya procesados
  const processedIds = new Set([
    ...refProgress.completedModels.map((m) => m.id),
    ...refProgress.failedModels.map((m) => m.id),
  ]);

  // Buscar modelos con reference = 'N/A' que no hayan sido procesados
  const modelsToProcess = await WatchModel.findAll({
    where: {
      reference: 'N/A',
    },
    include: [
      {
        association: 'brand',
        attributes: ['name'],
      },
    ],
    limit: BATCH_SIZE,
    order: [['id', 'ASC']],
  });

  // Filtrar modelos ya procesados
  const pendingModels = modelsToProcess.filter((m) => !processedIds.has(m.id));

  if (pendingModels.length === 0) {
    console.log('\n✓ No hay modelos pendientes de procesar');
    console.log(`  Modelos completados: ${refProgress.completedModels.length}`);
    console.log(`  Modelos con error: ${refProgress.failedModels.length}`);
    if (refProgress.stats.totalSuccess + refProgress.stats.totalFailed > 0) {
      const rate = (
        (refProgress.stats.totalSuccess / (refProgress.stats.totalSuccess + refProgress.stats.totalFailed)) *
        100
      ).toFixed(2);
      console.log(`  Tasa de éxito: ${rate}%\n`);
    }
    return;
  }

  let successCount = 0;
  let failCount = 0;

  console.log(`\n📊 Procesando ${pendingModels.length} modelos...`);
  console.log(`   Completados: ${refProgress.completedModels.length}`);
  console.log(`   Con error: ${refProgress.failedModels.length}\n`);

  for (const model of pendingModels) {
    const brandName = model.brand?.name || 'Unknown';

    try {
      const { reference, found } = await searchReferenceForModel(model.name, brandName);

      // Actualizar el modelo en la BD
      await model.update({ reference });

      // Guardar progreso
      refProgress.completedModels.push({
        id: model.id,
        name: model.name,
        brandName,
        reference,
        found,
      });

      successCount += 1;
      refProgress.stats.totalSuccess += 1;

      const status = found ? '✓' : '⚠';
      console.log(`${status} [${model.id}] ${brandName} - ${model.name}: "${reference}"`);
    } catch (error) {
      failCount += 1;
      refProgress.stats.totalFailed += 1;

      refProgress.failedModels.push({
        id: model.id,
        name: model.name,
        brandName,
        error: error.message,
        attemptedAt: new Date().toISOString(),
      });

      console.error(`✗ [${model.id}] ${brandName} - ${model.name}: ${error.message}`);
    }

    refProgress.stats.totalProcessed += 1;
  }

  saveReferencesProgress(refProgress);

  // Resumen final
  console.log(`\n📈 Resumen de esta ejecución:`);
  console.log(`   Éxitos: ${successCount}`);
  console.log(`   Errores: ${failCount}`);
  console.log(`   Total procesado (acumulado): ${refProgress.stats.totalProcessed}`);
  if (refProgress.stats.totalSuccess + refProgress.stats.totalFailed > 0) {
    const rate = (
      (refProgress.stats.totalSuccess / (refProgress.stats.totalSuccess + refProgress.stats.totalFailed)) *
      100
    ).toFixed(2);
    console.log(`   Tasa de éxito: ${rate}%\n`);
  }
}

async function importWatches() {
  requireApiToken();
  await sequelize.authenticate();

  const progress = loadProgress();
  let pendingBrandNames = progress.failedBrands;
  let totalBrandNames = progress.completedBrands.length + progress.failedBrands.length;

  if (pendingBrandNames.length === 0) {
    const brandNames = await requestTheWatchApi('/brand/list');
    totalBrandNames = brandNames.length;
    pendingBrandNames = brandNames.filter(
      (brandName) => !progress.completedBrands.includes(brandName)
    );
  }

  let insertedBrands = 0;
  let existingBrands = 0;
  let insertedModels = 0;
  let existingModels = 0;
  let failedBrands = 0;

  console.log(`Marcas conocidas: ${totalBrandNames}`);
  console.log(`Marcas ya completadas: ${progress.completedBrands.length}`);
  console.log(`Marcas pendientes en esta ejecucion: ${pendingBrandNames.length}`);

  for (const brandName of pendingBrandNames) {
    const { brand, created } = await findOrCreateBrand(brandName);

    if (!brand) {
      continue;
    }

    if (created) {
      insertedBrands += 1;
    } else {
      existingBrands += 1;
    }

    try {
      const result = await importModelsForBrand(brand);
      insertedModels += result.inserted;
      existingModels += result.existing;

      console.log(
        `${brand.name}: ${result.inserted} modelos insertados, ${result.existing} ya existentes`
      );

      markBrandCompleted(progress, brand.name);
    } catch (error) {
      failedBrands += 1;
      markBrandFailed(progress, brand.name);
      console.error(`Error importando modelos de ${brand.name}: ${error.message}`);
    }
  }

  console.log('Importacion finalizada');
  console.log(`Marcas insertadas: ${insertedBrands}`);
  console.log(`Marcas existentes: ${existingBrands}`);
  console.log(`Modelos insertados: ${insertedModels}`);
  console.log(`Modelos existentes: ${existingModels}`);
  console.log(`Marcas con error: ${failedBrands}`);
}

async function showStatus() {
  await sequelize.authenticate();

  const progress = loadProgress();
  const refProgress = loadReferencesProgress();
  const totalBrands = await Brand.count();
  const totalModels = await WatchModel.count();
  const modelsWithNA = await WatchModel.count({
    where: { reference: 'N/A' },
  });
  const modelsWithRef = totalModels - modelsWithNA;

  console.log('\n📊 Estado de Importación');
  console.log('='.repeat(60));
  console.log('🏭 FASE 1: Importación de Marcas y Modelos');
  console.log('-'.repeat(60));
  console.log(`Marcas completadas: ${progress.completedBrands.length}`);
  console.log(`Marcas con error: ${progress.failedBrands.length}`);
  console.log(`Marcas en BD: ${totalBrands}`);
  console.log(`Modelos en BD: ${totalModels}`);
  
  console.log('\n🔍 FASE 2: Completación de Referencias');
  console.log('-'.repeat(60));
  console.log(`Modelos con referencia: ${modelsWithRef}`);
  console.log(`Modelos sin referencia (N/A): ${modelsWithNA}`);
  console.log(`Modelos completados: ${refProgress.completedModels.length}`);
  console.log(`Modelos con error: ${refProgress.failedModels.length}`);
  if (refProgress.stats.totalSuccess + refProgress.stats.totalFailed > 0) {
    const rate = (
      (refProgress.stats.totalSuccess / (refProgress.stats.totalSuccess + refProgress.stats.totalFailed)) *
      100
    ).toFixed(2);
    console.log(`Tasa de éxito: ${rate}%`);
  }

  const progressPercentage = ((modelsWithRef / totalModels) * 100).toFixed(2);
  console.log(`\n📈 Progreso total: ${progressPercentage}%`);
  console.log('='.repeat(60) + '\n');
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    if (command === 'status') {
      await showStatus();
    } else if (command === 'refs') {
      await importReferences();
    } else {
      // Sin argumentos o comando desconocido = ejecutar FASE 1
      await importWatches();
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

main();
