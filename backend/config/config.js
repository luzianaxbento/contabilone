require('dotenv').config();

module.exports = {
  // Configuração do banco de dados
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'sistema_contabil',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  // Configuração do servidor
  server: {
    port: parseInt(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  
  // Configuração de autenticação
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'sistema_contabil_secret_key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    saltRounds: 10
  },
  
  // Configuração de logs
  logs: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  },
  
  // Configuração de CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};

