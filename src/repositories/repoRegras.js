const { Regra } = require('../model/Regra');

async function criarRegra(dadosRegra) {
  const { empresa_id, nome, tipo, valor_minimo, pontos, multiplicador } = dadosRegra;

  // Validar dados baseados no tipo
  if (tipo === 'por_compra' && (!pontos || pontos <= 0)) {
    throw new Error('Pontos por compra deve ser maior que zero');
  }

  if (tipo === 'por_valor') {
    if (!multiplicador || multiplicador <= 0) {
      throw new Error('Multiplicador deve ser maior que zero para regra do tipo "por_valor"');
    }
    if (!valor_minimo && valor_minimo !== 0) {
      throw new Error('Valor mínimo é obrigatório para regra do tipo "por_valor"');
    }
  }

  return Regra.create({
    empresa_id,
    nome,
    tipo,
    valor_minimo: valor_minimo || 0,
    pontos: pontos || 0,
    multiplicador: multiplicador || 1.0,
    ativa: true
  });
}

async function listarRegrasPorEmpresa(empresa_id) {
  return Regra.findAll({
    where: { empresa_id },
    order: [['data_cadastro', 'DESC']]
  });
}

async function ativarDesativarRegra(regra_id, ativa, usuario_id, role) {
  const regra = await Regra.findByPk(regra_id);
  
  if (!regra) {
    throw new Error('Regra não encontrada');
  }

  // Verificar permissão
  if (role === 'empresa' && regra.empresa_id !== usuario_id) {
    throw new Error('Você só pode modificar regras da sua empresa');
  }

  regra.ativa = ativa;
  await regra.save();

  return regra;
}

async function excluirRegra(regra_id, usuario_id, role) {
  const regra = await Regra.findByPk(regra_id);
  
  if (!regra) {
    throw new Error('Regra não encontrada');
  }

  // Verificar permissão
  if (role === 'empresa' && regra.empresa_id !== usuario_id) {
    throw new Error('Você só pode excluir regras da sua empresa');
  }

  if (role === 'cliente') {
    throw new Error('Clientes não podem excluir regras');
  }

  await regra.destroy();
}

module.exports = {
  criarRegra,
  listarRegrasPorEmpresa,
  ativarDesativarRegra,
  excluirRegra
};