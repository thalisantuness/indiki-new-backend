const { Regra } = require('../model/Regra');
const { Usuario } = require('../model/Usuarios');  // Import OK aqui (repo, não model)

async function setRegraUnica(dadosRegra) {
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

  // Buscar regra existente
  let regra = await Regra.findOne({ where: { empresa_id } });
  const regraData = {
    empresa_id,
    nome: nome || 'Regra Padrão',
    tipo,
    valor_minimo: valor_minimo || 0,
    pontos: pontos || 0,
    multiplicador: multiplicador || 1.0,
    ativa: true
  };

  if (regra) {
    // Atualizar
    await Regra.update(regraData, { where: { regra_id: regra.regra_id } });
    regra = await Regra.findByPk(regra.regra_id);
  } else {
    // Criar e vincular ao usuario
    regra = await Regra.create(regraData);
    await Usuario.update({ regra_id: regra.regra_id }, { where: { usuario_id: empresa_id } });
  }

  // Computar descricao para resposta
  regra.descricao = regra.tipo === 'por_compra' 
    ? `${regra.pontos} pontos por compra` 
    : `${regra.multiplicador} pontos por real gasto`;

  return regra;
}

async function getRegraUnica(empresa_id) {
  const regra = await Regra.findOne({
    where: { empresa_id, ativa: true }
  });
  if (regra) {
    // Computar descricao
    regra.descricao = regra.tipo === 'por_compra' 
      ? `${regra.pontos} pontos por compra` 
      : `${regra.multiplicador} pontos por real gasto`;
  }
  return regra;
}

module.exports = {
  setRegraUnica,
  getRegraUnica,
};