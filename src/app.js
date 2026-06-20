const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api.routes');
const chatRoutes = require('./routes/chat.routes');
const authRoutes = require('./routes/api/auth.routes');
const profileRoutes = require('./routes/api/profiles.routes');


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);
app.use('/api/chats', chatRoutes);

    res.status(404).json({ message: 'Ruta no encontrada' });
app.use((_req, res) => {
});

app.use((error, _req, res) => {
    const status = error.status || 500;
    res.status(status).json({
        message: error.message || 'Error interno del servidor',
    });
});

module.exports = app;
      