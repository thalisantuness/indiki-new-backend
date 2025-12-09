const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const { Regra } = require('./Regra');  // Mantido: Sem ciclo, pois Regra não importa de volta

const Usuario = sequelize.define('Usuario', {
  usuario_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  senha: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  role: {
    type: Sequelize.ENUM('cliente', 'admin', 'empresa'),
    allowNull: false,
    defaultValue: 'cliente',
  },
  pontos: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  cnpj: {
    type: Sequelize.STRING(18),
    allowNull: true,
  },
  endereco: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  telefone: {
    type: Sequelize.STRING(20),
    allowNull: true,
  },
  status: {
    type: Sequelize.ENUM('ativo', 'pendente', 'bloqueado'),
    defaultValue: 'pendente',
  },
  regra_id: {  // FK para a única regra vinculada
    type: Sequelize.INTEGER,
    allowNull: true,
    references: { model: 'regras', key: 'regra_id' },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  data_cadastro: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  data_update: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
}, {
  schema: 'public',
  tableName: 'usuarios',
  timestamps: false,
  indexes: [
    { fields: ['regra_id'] }
  ]
});

// Mantido: Associação com Regra (unidirecional agora)
Usuario.belongsTo(Regra, {
  foreignKey: 'regra_id',
  as: 'regra'
});

module.exports = { Usuario };