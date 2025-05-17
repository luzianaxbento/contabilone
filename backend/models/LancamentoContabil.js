const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const PlanoContas = require('./PlanoContas');

const LancamentoContabil = sequelize.define('LancamentoContabil', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_lancamento: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  data_lancamento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  data_competencia: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  tipo_lancamento: {
    type: DataTypes.ENUM('NORMAL', 'ABERTURA', 'ENCERRAMENTO', 'AJUSTE', 'RECLASSIFICACAO'),
    allowNull: false
  },
  historico: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  valor: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  origem: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  origem_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDENTE', 'APROVADO', 'REJEITADO', 'ESTORNADO'),
    allowNull: false
  }
}, {
  tableName: 'lancamentos_contabeis',
  schema: 'sistema_contabil',
  timestamps: true,
  createdAt: 'data_criacao',
  updatedAt: 'data_atualizacao'
});

const PartidaLancamento = sequelize.define('PartidaLancamento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  lancamento_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lancamentos_contabeis',
      key: 'id'
    }
  },
  conta_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'plano_contas',
      key: 'id'
    }
  },
  centro_custo_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'centros_custo',
      key: 'id'
    }
  },
  tipo: {
    type: DataTypes.ENUM('DEBITO', 'CREDITO'),
    allowNull: false
  },
  valor: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  historico_complementar: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'partidas_lancamento',
  schema: 'sistema_contabil',
  timestamps: true,
  createdAt: 'data_criacao',
  updatedAt: 'data_atualizacao'
});

// Relacionamentos
LancamentoContabil.hasMany(PartidaLancamento, { as: 'partidas', foreignKey: 'lancamento_id' });
PartidaLancamento.belongsTo(LancamentoContabil, { foreignKey: 'lancamento_id' });
PartidaLancamento.belongsTo(PlanoContas, { as: 'conta', foreignKey: 'conta_id' });

module.exports = {
  LancamentoContabil,
  PartidaLancamento
};
