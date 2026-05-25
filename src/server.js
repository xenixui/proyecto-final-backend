const express = require("express");
const sequelize = require("./config/database");

const app = express();

app.use(express.json());

sequelize.authenticate()
  .then(() => {
    console.log("Conectado a MySQL");
  })
  .catch(err => {
    console.error("Error conexión BD:", err);
  });

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});