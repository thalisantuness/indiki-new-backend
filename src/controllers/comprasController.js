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

  async function criarCompra(req, res) { 
    const { cliente_id, valor } = req.body;
    const { usuario_id, role } = req.user;

    if (role !== 'empresa' && role !== 'admin') {
      return res.status(403).json({ error: 'Apenas empresas podem criar compras' });
    }

    if (!usuario_id) {
      return res.status(400).json({ error: 'ID de usuário não encontrado' });
    }

    try {
      const novaCompra = await compraRepository.criarCompra({ 
        cliente_id, 
        empresa_id: usuario_id,
        valor 
      });
      
      res.status(201).json(novaCompra);
    } catch (error) {
      console.error('Erro ao criar compra:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async function gerarQRCodeCompra(req, res) {
    const { compra_id } = req.params;
    const { usuario_id, role } = req.user;

    try {
      // Verificar se usuário tem permissão
      const compra = await compraRepository.buscarCompraPorId(compra_id, usuario_id, role);
      
      if (!compra) {
        return res.status(404).json({ error: 'Compra não encontrada ou você não tem permissão' });
      }

      if (compra.status !== 'pendente') {
        return res.status(400).json({ error: 'Compra já foi processada' });
      }

      const qrCodeData = await qrCodeService.gerarQRCodeParaCompra(compra_id, usuario_id);
      res.status(200).json(qrCodeData);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async function validarQRCode(req, res) {
    const { qr_code_data } = req.body;
    const { usuario_id, role } = req.user;

    if (role !== 'empresa' && role !== 'admin') {
      return res.status(403).json({ error: 'Apenas empresas podem validar QR Codes' });
    }

    try {
      const resultado = await compraRepository.validarQRCodeCompra(qr_code_data, usuario_id);
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Erro ao validar QR Code:', error);
      res.status(500).json({ error: error.message });
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
    criarCompra,
    gerarQRCodeCompra,
    validarQRCode,
    atualizarCompra,
    excluirCompra,
    estatisticasEmpresa,
  };
}

module.exports = comprasController;