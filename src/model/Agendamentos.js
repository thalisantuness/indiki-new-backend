const Sequelize = require('sequelize');
const sequelize = require('../utils/db');
const { Usuario } = require('./Usuarios'); 

const Agendamento = sequelize.define('agendamentos', {
  agendamento_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cliente_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'usuario_id'
    }
  },
  admin_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'usuario_id'
    }
  },
  data_hora: {
    type: Sequelize.DATE,
    allowNull: false
  },
  servico: {
    type: Sequelize.STRING,
    allowNull: false
  },
  status: {
    type: Sequelize.ENUM('pendente', 'confirmado', 'cancelado', 'realizado'),
    defaultValue: 'pendente'
  },
  observacoes: {
    type: Sequelize.TEXT,
    allowNull: true
  }
}, {
  schema: 'public',
  tableName: 'agendamentos',
  timestamps: true,
  createdAt: 'data_criacao',
  updatedAt: 'data_atualizacao'
});

Agendamento.belongsTo(Usuario, {
    foreignKey: 'cliente_id',
    as: 'cliente'
  });

  Agendamento.belongsTo(Usuario, {
    foreignKey: 'admin_id',
    as: 'admin'
  });

module.exports = { Agendamento };