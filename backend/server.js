const app = require('./app');
const config = require('./config/config');

// Iniciar o servidor
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} em ambiente ${config.server.env}`);
  console.log(`API disponível em http://localhost:${PORT}/api/v1`);
});
