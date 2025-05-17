const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cargo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  perfil: {
    type: DataTypes.ENUM('ADMIN', 'CONTADOR', 'AUXILIAR', 'GERENTE', 'CONSULTA'),
    allowNull: false
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  ultimo_acesso: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'usuarios',
  schema: 'sistema_contabil',
  timestamps: true,
  createdAt: 'data_criacao',
  updatedAt: 'data_atualizacao'
});

// Hook para criptografar a senha antes de salvar
Usuario.beforeCreate(async (usuario) => {
  if (usuario.senha) {
    usuario.senha = await bcrypt.hash(usuario.senha, config.auth.saltRounds);
  }
});

Usuario.beforeUpdate(async (usuario) => {
  if (usuario.changed('senha')) {
    usuario.senha = await bcrypt.hash(usuario.senha, config.auth.saltRounds);
  }
});

// Método para verificar senha
Usuario.prototype.verificarSenha = async function(senha) {
  return bcrypt.compare(senha, this.senha);
};

module.exports = Usuario;
