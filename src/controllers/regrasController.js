const regraRepository = require('../repositories/repoRegras');

function regrasController() {
  
  async function criarRegra(req, res) {
    const { nome, tipo, valor_minimo, pontos, multiplicador } = req.body;
    const { usuario_id, role } = req.user;

    if (role !== 'empresa' && role !== 'admin') {
      return res.status(403).json({ error: 'Apenas empresas podem criar regras' });
    }

    try {
      const regra = await regraRepository.criarRegra({
        empresa_id: usuario_id,
        nome,
        tipo,
        valor_minimo,
        pontos,
        multiplicador
      });
      res.status(201).json(regra);
    } catch (error) {
      console.error('Erro ao criar regra:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async function listarRegrasEmpresa(req, res) {
    const { usuario_id, role } = req.user;

    try {
      const regras = await regraRepository.listarRegrasPorEmpresa(usuario_id);
      res.status(200).json(regras);
    } catch (error) {
      console.error('Erro ao listar regras:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async function listarRegrasPorEmpresaId(req, res) {
    const { empresa_id } = req.params;

    try {
      const regras = await regraRepository.listarRegrasPorEmpresa(empresa_id);
      res.status(200).json(regras);
    } catch (error) {
      console.error('Erro ao listar regras:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async function ativarDesativarRegra(req, res) {
    const { regra_id } = req.params;
    const { ativa } = req.body;
    const { usuario_id, role } = req.user;

    try {
      const regra = await regraRepository.ativarDesativarRegra(regra_id, ativa, usuario_id, role);
      res.status(200).json(regra);
    } catch (error) {
      console.error('Erro ao atualizar regra:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async function excluirRegra(req, res) {
    const { regra_id } = req.params;
    const { usuario_id, role } = req.user;

    try {
      await regraRepository.excluirRegra(regra_id, usuario_id, role);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir regra:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async function criarRegrasPadrao(req, res) {
    const { usuario_id, role } = req.user;

    if (role !== 'empresa' && role !== 'admin') {
      return res.status(403).json({ error: 'Apenas empresas podem criar regras' });
    }

    try {
      // Regra 1: Pontuar por compra
      await regraRepository.criarRegra({
        empresa_id: usuario_id,
        nome: 'Pontos por Compra',
        tipo: 'por_compra',
        pontos: 1,
        ativa: true
      });

      // Regra 2: Pontuar por valor (1 ponto a cada R$ 10,00)
      await regraRepository.criarRegra({
        empresa_id: usuario_id,
        nome: 'Pontos por Valor',
        tipo: 'por_valor',
        valor_minimo: 0,
        multiplicador: 0.1, // 1 ponto a cada R$ 10,00
        pontos: 0, // Não usado em tipo por_valor
        ativa: true
      });

      res.status(201).json({ 
        message: 'Regras padrão criadas com sucesso',
        regras: await regraRepository.listarRegrasPorEmpresa(usuario_id)
      });
    } catch (error) {
      console.error('Erro ao criar regras padrão:', error);
      res.status(500).json({ error: error.message });
    }
  }

  return {
    criarRegra,
    listarRegrasEmpresa,
    listarRegrasPorEmpresaId,
    ativarDesativarRegra,
    excluirRegra,
    criarRegrasPadrao,
  };
}

module.exports = regrasController;