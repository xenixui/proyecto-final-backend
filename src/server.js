require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');
require('./models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a MySQL');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error conexión BD:', error);
    process.exit(1);
  }
}

startServer();