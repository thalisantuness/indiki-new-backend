const Sequelize = require('sequelize');
const sequelize = require('../utils/db');

const Usuario = sequelize.define('Usuario', {
  usuario_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O campo "nome" não pode estar vazio.',
      },
      notNull: {
        msg: 'O campo "nome" é obrigatório.',
      },
      isSafeCharacters(value) {
        const regex = /^[a-zA-Z0-9\sáÁàÀâÂãÃéÉèÈêÊíÍìÌîÎóÓòÒôÔõÕúÚùÙûÛüÜñÑçÇ]+$/;
        if (!regex.test(value)) {
          throw new Error('O campo "nome" contém caracteres inválidos.');
        }
      },
    },
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'O campo "email" não pode estar vazio.',
      },
      isEmail: {
        msg: 'O campo "email" deve ser um endereço de e-mail válido.',
      },
      notNull: {
        msg: 'O campo "email" é obrigatório.',
      },
    },
  },
  senha: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  role: {
    type: Sequelize.ENUM('cliente', 'admin'),
    allowNull: false,
    defaultValue: 'cliente',
  },
  pontos: {
    type: Sequelize.INTEGER,
    allowNull: true, 
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
});

module.exports = { Usuario };
