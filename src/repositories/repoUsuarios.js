const { Usuario } = require('../model/Usuarios');
const { Regra } = require('../model/Regra');  // ADICIONADO
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

async function listarUsuarios() {
  return Usuario.findAll({
    include: [  // ADICIONADO: Include regra só para empresas
      {
        model: Regra,
        as: 'regra',
        required: false,
        attributes: ['regra_id', 'nome', 'tipo', 'pontos', 'multiplicador']
      }
    ]
  }).then(usuarios => usuarios.map(u => {
    if (u.role === 'empresa' && u.regra) {
      // ADICIONADO: Computar descricao
      const regra = u.regra;
      u.descricao_regra = regra.tipo === 'por_compra' 
        ? `${regra.pontos} pontos por compra` 
        : `${regra.multiplicador} pontos por real gasto`;
    }
    return u;
  }));
}

async function listarEmpresas(whereClause = {}) {
  const defaultWhere = {
    role: 'empresa',
    status: 'ativo',
    ...whereClause
  };
  return Usuario.findAll({
    where: defaultWhere,
    include: [  // ADICIONADO: Include regra
      {
        model: Regra,
        as: 'regra',
        required: false,
        attributes: ['regra_id', 'nome', 'tipo', 'pontos', 'multiplicador']
      }
    ],
    order: [['data_cadastro', 'DESC']]
  }).then(empresas => empresas.map(e => {
    if (e.regra) {
      // ADICIONADO: Computar descricao
      const regra = e.regra;
      e.descricao_regra = regra.tipo === 'por_compra' 
        ? `${regra.pontos} pontos por compra` 
        : `${regra.multiplicador} pontos por real gasto`;
    }
    return e;
  }));
}

async function criarUsuario(dadosUsuario) {
  const { nome, email, senha, role } = dadosUsuario;
  if (!senha) {
      throw new Error('Senha é obrigatória');
  }
  const usuarioExistente = await Usuario.findOne({ where: { email } });
  if (usuarioExistente) {
      throw new Error('Usuário com este email já existe');
  }
  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      role: role || 'cliente',
      pontos: 0,
      status: role === 'empresa' ? 'pendente' : 'ativo'
  });
  console.log(`Usuário ${nome} criado com sucesso`);
  return usuario;
}

async function tornarUsuarioAdmin(id) {
  const usuarioExistente = await Usuario.findByPk(id);
  if (!usuarioExistente) {
      throw new Error('Usuário não existe');
  }
  await Usuario.update({
      role: 'admin'
  }, {
      where: { usuario_id: id }
  });
  return Usuario.findByPk(id);
}

async function tornarUsuarioEmpresa(id) {
  const usuarioExistente = await Usuario.findByPk(id);
  if (!usuarioExistente) {
      throw new Error('Usuário não existe');
  }
  await Usuario.update({
      role: 'empresa',
      status: 'pendente'
  }, {
      where: { usuario_id: id }
  });
  return Usuario.findByPk(id);
}

async function aprovarEmpresa(id) {
  const usuarioExistente = await Usuario.findByPk(id);
  if (!usuarioExistente) {
      throw new Error('Empresa não existe');
  }
  if (usuarioExistente.role !== 'empresa') {
      throw new Error('Usuário não é uma empresa');
  }
  await Usuario.update({
      status: 'ativo'
  }, {
      where: { usuario_id: id }
  });
  return Usuario.findByPk(id);
}

// AJUSTADO: Aceita também campos de regra para edição via perfil
async function atualizarDadosEmpresa(usuario_id, dados) {
  const { cnpj, endereco, telefone, nome_regra, tipo, valor_minimo, pontos, multiplicador } = dados;
  const usuarioExistente = await Usuario.findByPk(usuario_id, { include: [{ model: Regra, as: 'regra' }] });
  
  if (!usuarioExistente) {
      throw new Error('Usuário não existe');
  }
  if (usuarioExistente.role !== 'empresa') {
      throw new Error('Usuário não é uma empresa');
  }

  // Atualizar dados básicos
  await Usuario.update({
      cnpj,
      endereco,
      telefone
  }, {
      where: { usuario_id }
  });

  // NOVO: Se fornecidos campos de regra, atualizar/criar regra e vincular
  if (nome_regra || tipo || pontos !== undefined || multiplicador !== undefined) {
    const regraData = {
      empresa_id: usuario_id,
      nome: nome_regra || 'Regra Padrão',
      tipo: tipo || 'por_compra',
      valor_minimo: valor_minimo || 0,
      pontos: pontos || 1,
      multiplicador: multiplicador || 1.0,
      ativa: true
    };

    let regra = usuarioExistente.regra;
    if (regra) {
      // Atualizar existente
      await Regra.update(regraData, { where: { regra_id: regra.regra_id } });
    } else {
      // Criar nova
      regra = await Regra.create(regraData);
      // Vincular ao usuario
      await Usuario.update({ regra_id: regra.regra_id }, { where: { usuario_id } });
    }
  }

  return Usuario.findByPk(usuario_id, { include: [{ model: Regra, as: 'regra' }] });
}

async function atualizarUsuario(dadosUsuario) {
  const { nome, email, senha } = dadosUsuario;
  const usuarioExistente = await buscarUsuario(email);
  if (!usuarioExistente) {
      throw new Error('Usuário não existe');
  }
  if (senha) {
      dadosUsuario.senha = await bcrypt.hash(senha, 10);
  }
  await Usuario.update({
      nome,
      senha: dadosUsuario.senha,
  }, {
      where: { email }
  });
  return buscarUsuario(email);
}

async function excluirUsuario(email) {
  const usuarioExistente = await buscarUsuario(email);
  if (!usuarioExistente) {
      throw new Error('Usuário não encontrado');
  }
  await Usuario.destroy({ where: { email } });
  console.log(`Usuário com email ${email} excluído com sucesso`);
}

async function buscarUsuario(email) {
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
      throw new Error('Usuário não encontrado');
  }
  return usuario;
}

async function givePoints(id, pontos) {
  const usuarioExistente = await Usuario.findByPk(id);
  if (!usuarioExistente) {
      throw new Error('Usuário não encontrado');
  }
  usuarioExistente.pontos += pontos;
  await usuarioExistente.save();
  return usuarioExistente;
}

module.exports = {
    listarUsuarios,
    listarEmpresas,
    criarUsuario,
    atualizarUsuario,
    excluirUsuario,
    buscarUsuario,
    tornarUsuarioAdmin,
    tornarUsuarioEmpresa,
    aprovarEmpresa,
    atualizarDadosEmpresa,
    givePoints
};