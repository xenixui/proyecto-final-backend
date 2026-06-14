const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.use((res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use((error,  res) => {
    const status = error.status || 500;
    res.status(status).json({
        message: error.message || 'Error interno del servidor',
    });
});

module.exports = app;
