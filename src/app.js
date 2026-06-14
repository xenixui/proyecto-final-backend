const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api.routes');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API Marketplace funcionando',
    endpoints: {
      api: '/api',
      auth: '/api/auth',
      chats: '/api/chats',
    },
  });
});

app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({
    message: error.message || 'Error interno del servidor',
  });
});

module.exports = app;
