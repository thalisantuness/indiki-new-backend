const compraRepository = require('../repositories/repoCompras');
const qrCodeService = require('../services/qrCodeService');
const regraRepository = require('../repositories/repoRegras');

function comprasController() {
  async function listarCompras(req, res) {
    const { usuario_id, role } = req.user;
    try {
      let compras;
      if (role === 'admin') {
        compras = await compraRepository.listarCompras();
      } else if (role === 'empresa') {
        compras = await compraRepository.listarComprasPorEmpresa(usuario_id);
      } else {
        compras = await compraRepository.listarComprasPorCliente(usuario_id);
      }
      res.status(200).json(compras);
    } catch (error) {
      console.error('Erro ao listar compras:', error);
      res.status(500).json({ error: 'Erro ao listar compras' });
    }
  }

  async function buscarCompraPorId(req, res) {
    const { id } = req.params;
    const { usuario_id, role } = req.user;
    try {
      const compra = await compraRepository.buscarCompraPorId(id, usuario_id, role);
      res.status(200).json(compra);
    } catch (error) {
      console.error(`Erro ao buscar compra com ID ${id}:`, error);
      res.status(404).json({ error: error.message });
    }
  }

  async function gerarQRCode(req, res) {
    const { valor } = req.body;
    const { usuario_id, role } = req.user;
    if (role !== 'empresa') {
      return res.status(403).json({ error: 'Apenas empresas podem gerar QR codes' });
    }
    if (!valor || valor <= 0) {
      return res.status(400).json({ error: 'Valor da compra é obrigatório e deve ser positivo' });
    }
    try {
      // Criar compra pendente (cliente_id = null)
      const compra = await compraRepository.criarCompra({
        cliente_id: null,
        empresa_id: usuario_id,
        valor: parseFloat(valor)
      });
      // Gerar QR para esta compra pendente
      const qrCodeData = await qrCodeService.gerarQRCodeParaCompra(compra.compra_id, usuario_id);
      res.status(201).json({
        message: 'QR code gerado com sucesso para compra pendente',
        compra_id: compra.compra_id,
        ...qrCodeData
      });
    } catch (error) {
      console.error('Erro ao gerar QR code:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async function claimCompra(req, res) {
    const { qr_code_data } = req.body;
    const { usuario_id, role } = req.user;
    if (role !== 'cliente') {
      return res.status(403).json({ error: 'Apenas clientes podem claimar compras' });
    }
    if (!qr_code_data) {
      return res.status(400).json({ error: 'Dados do QR code são obrigatórios' });
    }
    try {
      const resultado = await compraRepository.claimCompra(qr_code_data, usuario_id);
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro ao claimar compra:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async function atualizarCompra(req, res) {
    const { id } = req.params;
    const dadosAtualizados = req.body;
    const { usuario_id, role } = req.user;
    try {
      const compraAtualizada = await compraRepository.atualizarCompra(id, dadosAtualizados, usuario_id, role);
      res.status(200).json(compraAtualizada);
    } catch (error) {
      console.error(`Erro ao atualizar compra com ID ${id}:`, error);
      res.status(404).json({ error: error.message });
    }
  }

  async function excluirCompra(req, res) {
    const { id } = req.params;
    const { usuario_id, role } = req.user;
    try {
      await compraRepository.excluirCompra(id, usuario_id, role);
      res.status(204).send();
    } catch (error) {
      console.error(`Erro ao excluir compra com ID ${id}:`, error);
      res.status(404).json({ error: error.message });
    }
  }

  async function estatisticasEmpresa(req, res) {
    const { usuario_id, role } = req.user;
    if (role !== 'empresa' && role !== 'admin') {
      return res.status(403).json({ error: 'Apenas empresas podem ver estatísticas' });
    }
    try {
      const estatisticas = await compraRepository.estatisticasEmpresa(usuario_id);
      res.status(200).json(estatisticas);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: error.message });
    }
  }

  return {
    listarCompras,
    buscarCompraPorId,
    gerarQRCode,
    claimCompra,
    atualizarCompra,
    excluirCompra,
    estatisticasEmpresa,
  };
}

module.exports = comprasController;