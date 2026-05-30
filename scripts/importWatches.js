require('dotenv').config();

const axios = require('axios');
const sequelize = require('../src/config/database');
const { Brand, WatchModel } = require('../src/models');

const API_BASE_URL = 'https://api.thewatchapi.com/v1';
const API_TOKEN = process.env.THEWATCHAPI_TOKEN;

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

async function importWatches() {
  requireApiToken();
  await sequelize.authenticate();

  const brandNames = await requestTheWatchApi('/brand/list');

  let insertedBrands = 0;
  let existingBrands = 0;
  let insertedModels = 0;
  let existingModels = 0;
  let failedBrands = 0;

  console.log(`Marcas encontradas en TheWatchAPI: ${brandNames.length}`);

  for (const brandName of brandNames) {
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
    } catch (error) {
      failedBrands += 1;
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

importWatches()
  .catch((error) => {
    console.error(`Error en la importacion: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
