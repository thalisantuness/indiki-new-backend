// repositories/repoCompras.js
const { Compra } = require('../model/Compra');
const { Usuario } = require('../model/Usuarios');
const { Regra } = require('../model/Regra');
const crypto = require('crypto');

async function listarCompras() {
  return Compra.findAll({
    include: [
      { 
        model: Usuario, 
        as: 'cliente',
        attributes: ['usuario_id', 'nome', 'email']
      },
      { 
        model: Usuario, 
        as: 'empresa',
        attributes: ['usuario_id', 'nome', 'email']
      }
    ],
    order: [['data_cadastro', 'DESC']]
  });
}

async function listarComprasPorEmpresa(empresa_id) {
  return Compra.findAll({
    where: { empresa_id },
    include: [
      { 
        model: Usuario, 
        as: 'cliente',
        attributes: ['usuario_id', 'nome', 'email']
      }
    ],
    order: [['data_cadastro', 'DESC']]
  });
}

async function listarComprasPorCliente(cliente_id) {
  return Compra.findAll({
    where: { cliente_id },
    include: [
      { 
        model: Usuario, 
        as: 'empresa',
        attributes: ['usuario_id', 'nome', 'email']
      }
    ],
    order: [['data_cadastro', 'DESC']]
  });
}

async function buscarCompraPorId(id, usuario_id, role) {
  const compra = await Compra.findOne({
    where: { compra_id: id },
    include: [
      { 
        model: Usuario, 
        as: 'cliente',
        attributes: ['usuario_id', 'nome', 'email', 'pontos']
      },
      { 
        model: Usuario, 
        as: 'empresa',
        attributes: ['usuario_id', 'nome', 'email']
      }
    ]
  });

  if (!compra) {
    throw new Error(`Compra com ID ${id} não encontrada`);
  }

  // Verificar permissões
  if (role === 'cliente' && compra.cliente_id !== usuario_id) {
    throw new Error('Você não tem permissão para ver esta compra');
  }

  if (role === 'empresa' && compra.empresa_id !== usuario_id) {
    throw new Error('Você não tem permissão para ver esta compra');
  }

  return compra;
}

async function criarCompra(dadosCompra) {
  const { cliente_id, empresa_id, valor } = dadosCompra;

  // Verificar se empresa existe e está ativa
  const empresa = await Usuario.findOne({ 
    where: { 
      usuario_id: empresa_id,
      role: 'empresa',
      status: 'ativo'
    }
  });

  if (!empresa) {
    throw new Error('Empresa não encontrada ou não está ativa');
  }

  // Verificar se cliente existe
  const cliente = await Usuario.findByPk(cliente_id);
  if (!cliente) {
    throw new Error('Cliente não encontrado');
  }

  if (cliente.role !== 'cliente') {
    throw new Error('Usuário não é um cliente válido');
  }

  // Calcular pontos baseado nas regras da empresa
  const pontos = await calcularPontosPorRegras(empresa_id, valor);

  // Gerar ID único para o QR Code
  const qr_code_id = crypto.randomBytes(16).toString('hex');

  // Criar dados básicos do QR Code
  const qrPayload = {
    compra_id: null, // Será atualizado após criar a compra
    qr_code_id,
    cliente_id,
    empresa_id,
    valor,
    timestamp: Date.now(),
    expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutos
  };

  // Criar compra
  const compra = await Compra.create({
    qr_code_id,
    cliente_id,
    empresa_id,
    valor,
    pontos_adquiridos: pontos,
    status: 'pendente',
    qr_code_data: JSON.stringify(qrPayload),
    qr_code_expira_em: new Date(qrPayload.expiresAt)
  });

  // Atualizar o payload com o ID da compra
  qrPayload.compra_id = compra.compra_id;
  await compra.update({ qr_code_data: JSON.stringify(qrPayload) });

  return compra;
}

async function calcularPontosPorRegras(empresa_id, valor) {
  // Buscar regras ativas da empresa
  const regras = await Regra.findAll({
    where: { 
      empresa_id, 
      ativa: true 
    }
  });

  let pontos = 0;

  for (const regra of regras) {
    if (regra.tipo === 'por_compra') {
      pontos += regra.pontos;
    } else if (regra.tipo === 'por_valor' && valor >= regra.valor_minimo) {
      pontos += Math.floor(valor * regra.multiplicador);
    }
  }

  return pontos;
}

async function validarQRCodeCompra(qr_code_data, empresa_id) {
  try {
    // Decodificar dados do QR Code
    const dados = JSON.parse(qr_code_data);
    const { compra_id, qr_code_id, cliente_id, empresa_id: qrEmpresaId, valor, expiresAt } = dados;

    // Verificar se a empresa que está validando é a mesma do QR Code
    if (empresa_id !== qrEmpresaId) {
      throw new Error('Este QR Code não pertence à sua empresa');
    }

    // Verificar se não expirou
    if (Date.now() > expiresAt) {
      throw new Error('QR Code expirado');
    }

    // Buscar compra
    const compra = await Compra.findOne({
      where: { 
        compra_id,
        qr_code_id,
        empresa_id,
        status: 'pendente'
      },
      include: [
        { model: Usuario, as: 'cliente' }
      ]
    });

    if (!compra) {
      throw new Error('Compra não encontrada ou já validada');
    }

    // Verificar se valor corresponde
    if (parseFloat(compra.valor) !== parseFloat(valor)) {
      throw new Error('Valor da compra não corresponde');
    }

    // Atualizar status da compra
    compra.status = 'validada';
    compra.validado_por = empresa_id;
    compra.validado_em = new Date();
    await compra.save();

    // Adicionar pontos ao cliente
    const cliente = await Usuario.findByPk(cliente_id);
    cliente.pontos += compra.pontos_adquiridos;
    await cliente.save();

    return {
      success: true,
      message: 'Compra validada com sucesso',
      compra: {
        compra_id: compra.compra_id,
        valor: compra.valor,
        pontos_adquiridos: compra.pontos_adquiridos,
        cliente_nome: compra.cliente.nome,
        cliente_novo_saldo: cliente.pontos
      }
    };

  } catch (error) {
    console.error('Erro na validação:', error);
    throw error;
  }
}

async function atualizarCompra(id, dadosAtualizados, usuario_id, role) {
  const compra = await buscarCompraPorId(id, usuario_id, role);

  // Empresas só podem atualizar compras pendentes que são delas
  if (role === 'empresa' && compra.empresa_id !== usuario_id) {
    throw new Error('Você só pode atualizar compras da sua empresa');
  }

  // Clientes não podem atualizar compras
  if (role === 'cliente') {
    throw new Error('Clientes não podem atualizar compras');
  }

  await Compra.update(dadosAtualizados, {
    where: { compra_id: id },
  });

  return buscarCompraPorId(id, usuario_id, role);
}

async function excluirCompra(id, usuario_id, role) {
  const compra = await buscarCompraPorId(id, usuario_id, role);

  // Apenas admin pode excluir compras
  if (role !== 'admin') {
    throw new Error('Apenas administradores podem excluir compras');
  }

  await Compra.destroy({ where: { compra_id: id } });
}

async function estatisticasEmpresa(empresa_id) {
  const compras = await Compra.findAll({
    where: { empresa_id, status: 'validada' },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('compra_id')), 'total_compras'],
      [sequelize.fn('SUM', sequelize.col('valor')), 'total_vendido'],
      [sequelize.fn('SUM', sequelize.col('pontos_adquiridos')), 'total_pontos_distribuidos']
    ]
  });

  const clientesUnicos = await Compra.count({
    where: { empresa_id, status: 'validada' },
    distinct: true,
    col: 'cliente_id'
  });

  return {
    total_compras: compras[0].dataValues.total_compras || 0,
    total_vendido: compras[0].dataValues.total_vendado || 0,
    total_pontos_distribuidos: compras[0].dataValues.total_pontos_distribuidos || 0,
    clientes_unicos: clientesUnicos
  };
}

module.exports = {
  listarCompras,
  listarComprasPorEmpresa,
  listarComprasPorCliente,
  buscarCompraPorId,
  criarCompra,
  validarQRCodeCompra,
  atualizarCompra,
  excluirCompra,
  estatisticasEmpresa,
  calcularPontosPorRegras
};