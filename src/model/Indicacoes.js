const Sequelize = require('sequelize');
const sequelize = require('../utils/db');

const Indicacao = sequelize.define('indicacoes', {
  indicacao_id: {
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

  usuario_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
 
}, 
{
  schema: 'public',
  tableName: 'indicacoes',
  timestamps: false 
});

module.exports = { Indicacao };
