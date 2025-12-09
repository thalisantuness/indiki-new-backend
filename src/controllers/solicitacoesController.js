const repoSolicitacoes = require('../repositories/repoSolicitacoes');
const { Recompensas } = require('../model/Recompensas');

function solicitacoesController() {
  async function listarSolicitacoes(req, res) {
    const { indicacao_id } = req.query;
    try {
      const solicitacoes = indicacao_id
        ? await repoSolicitacoes.listarSolicitacoesPorIndicacao(indicacao_id)
        : await repoSolicitacoes.getRequests();
      res.status(200).json(solicitacoes);
    } catch (error) {
      console.error('Erro ao listar solicitações:', error);
      res.status(500).json({ error: 'Não foi possível listar as solicitações no momento.' });
    }
  }

  async function buscarSolicitacaoPorId(req, res) {
    const { ticketId } = req.params;
    try {
      const solicitacao = await repoSolicitacoes.buscarSolicitacaoPorId(ticketId);
      if (!solicitacao) {
        return res.status(404).json({ error: 'Solicitação não encontrada.' });
      }
      res.status(200).json(solicitacao);
    } catch (error) {
      console.error('Erro ao buscar solicitação por ID:', error);
      res.status(500).json({ error: 'Não foi possível buscar a solicitação no momento.' });
    }
  }

  async function criarSolicitacao(req, res) {
    const { recom_id } = req.body;
    const { usuario_id, role } = req.user;
    if (role !== 'cliente') {
      return res.status(403).json({ error: 'Apenas usuários com a role "cliente" podem criar solicitações.' });
    }
    
    if (!usuario_id) {
      return res.status(400).json({ error: 'ID de usuário não encontrado' });
    }
    try {
      const solicitacao = await repoSolicitacoes.criarSolicitacao({
        recom_id,
        status: 'pendente',
        data_solicitacao: new Date(),
        usuario_id
      });
      res.status(201).json({ message: 'Solicitação criada com sucesso', solicitacao });
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      res.status(500).json({ error: 'Não foi possível criar a solicitação no momento.' });
    }
  }

  async function atualizarStatusSolicitacao(req, res) {
    const { ticketId } = req.params;
    const { status } = req.body;
    try {
      const solicitacao = await repoSolicitacoes.atualizarStatusSolicitacao(ticketId, status);
      if (!solicitacao) {
        return res.status(404).json({ error: 'Solicitação não encontrada.' });
      }
      res.status(200).json({ message: 'Status da solicitação atualizado com sucesso', solicitacao });
    } catch (error) {
      console.error('Erro ao atualizar status da solicitação:', error);
      res.status(500).json({ error: 'Não foi possível atualizar o status da solicitação no momento.' });
    }
  }

  async function processarSolicitacao(req, res) {
    const { id } = req.params;
    const { decisao } = req.body;
    const { role, usuario_id } = req.user;
   
    if (role !== 'empresa' && role !== 'admin') {
      return res.status(403).json({ error: 'Apenas empresas ou admins podem processar solicitações.' });
    }
 
    try {
      const resultado = await repoSolicitacoes.processarSolicitacao(id, decisao);
      if (resultado.message === 'Solicitação não encontrada.') {
        return res.status(404).json({ error: resultado.message });
      }
      // Check de ownership para empresa
      if (role === 'empresa') {
        const solicitacao = await repoSolicitacoes.getRequests().find(s => s.solicitacao_id === parseInt(id));  // Simplificado; ajuste se necessário
        const recompensa = await Recompensas.findByPk(solicitacao.recom_id);
        if (recompensa && recompensa.usuario_id !== usuario_id) {
          return res.status(403).json({ error: 'Você só pode processar recompensas da sua empresa' });
        }
      }
      res.status(200).json({ message: resultado.message });
    } catch (error) {
      console.error('Erro ao processar solicitação:', error);
      res.status(500).json({ error: 'Erro ao processar a solicitação.' });
    }
  }
 
  return {
    listarSolicitacoes,
    buscarSolicitacaoPorId,
    criarSolicitacao,
    atualizarStatusSolicitacao,
    processarSolicitacao,
  };
}

module.exports = solicitacoesController;