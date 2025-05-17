const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/config');
const { testConnection } = require('./config/database');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const contabilRoutes = require('./routes/contabilRoutes');

// Inicializar aplicação Express
const app = express();

// Middlewares
app.use(helmet()); // Segurança
app.use(cors(config.cors)); // CORS
app.use(express.json()); // Parsing de JSON
app.use(express.urlencoded({ extended: true })); // Parsing de URL-encoded

// Logging
if (config.server.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Testar conexão com o banco de dados
testConnection();

// Rota de status
app.get('/api/v1/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    versao: '1.0.0',
    ambiente: config.server.env,
    timestamp: new Date()
  });
});

// Rotas da API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/contabil', contabilRoutes);

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    mensagem: 'Rota não encontrada'
  });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  
  res.status(err.status || 500).json({
    sucesso: false,
    mensagem: err.message || 'Erro interno no servidor'
  });
});

module.exports = app;
