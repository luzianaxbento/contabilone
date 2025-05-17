const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlanoContas = sequelize.define('PlanoContas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  descricao: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('ATIVO', 'PASSIVO', 'RECEITA', 'DESPESA', 'RESULTADO'),
    allowNull: false
  },
  natureza: {
    type: DataTypes.ENUM('DEVEDORA', 'CREDORA'),
    allowNull: false
  },
  nivel: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  conta_pai_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'plano_contas',
      key: 'id'
    }
  },
  permite_lancamento: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'plano_contas',
  schema: 'sistema_contabil',
  timestamps: true,
  createdAt: 'data_criacao',
  updatedAt: 'data_atualizacao'
});

// Auto-relacionamento para hierarquia de contas
PlanoContas.belongsTo(PlanoContas, { as: 'contaPai', foreignKey: 'conta_pai_id' });
PlanoContas.hasMany(PlanoContas, { as: 'contasFilhas', foreignKey: 'conta_pai_id' });

module.exports = PlanoContas;
