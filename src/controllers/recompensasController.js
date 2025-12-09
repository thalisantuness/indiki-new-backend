const recompensasRepository = require('../repositories/repoRecompensas');

function recompensasController() {
  async function visualizarRecompensas(req, res) {
    const usuario_id = req.user.usuario_id;
    try {
      const recompensas = await recompensasRepository.listarRecompensas(usuario_id);
      if (recompensas.length === 0) {
        return res.status(404).json({ error: 'Nenhuma recompensa encontrada para esta empresa' });
      }
      res.json(recompensas);
    } catch (error) {
      console.error('Erro ao obter recompensas:', error);
      res.status(500).json({ error: 'Erro ao obter recompensas' });
    }
  }

  async function cadastrarRecompensas(req, res) {
    const { nome, pontos, estoque } = req.body;
    const usuario_id = req.user.usuario_id;
    if (!usuario_id) {
      return res.status(400).json({ error: 'ID de usuário não encontrado' });
    }
    console.log('Usuario ID:', usuario_id);
    try {
      const recompensa = await recompensasRepository.criarRecompensa({
        nome,
        pontos,
        estoque,
        usuario_id,
      });
      res.status(201).json({ message: `Recompensa ${nome} cadastrada com sucesso para o usuário ${usuario_id}`, recompensa });
    } catch (error) {
      console.error('Erro ao cadastrar recompensa:', error);
      res.status(500).json({ errorMessage: 'Erro ao cadastrar recompensa', error: error.message });
    }
  }

  async function atualizarRecompensas(req, res) {
    const { recom_id } = req.params;
    const { nome, pontos, estoque } = req.body;
    try {
      const recompensaAtualizada = await recompensasRepository.atualizarRecompensa(recom_id, {
        nome,
        pontos,
        estoque,
      });
      if (recompensaAtualizada) {
        res.json({ message: `Recompensa ${recom_id} atualizada com sucesso` });
      } else {
        res.status(404).json({ errorMessage: 'Recompensa não encontrada' });
      }
    } catch (error) {
      console.error('Erro ao atualizar recompensa:', error);
      res.status(500).json({ errorMessage: 'Erro ao atualizar recompensa', error: error.message });
    }
  }

  async function excluirRecom(req, res) {
    const { recom_id } = req.params;
    try {
      const excluido = await recompensasRepository.excluirRecompensa(recom_id);
      if (excluido) {
        res.json({ message: `Recompensa ${recom_id} excluída com sucesso` });
      } else {
        res.status(404).json({ message: `Recompensa ${recom_id} não encontrada` });
      }
    } catch (error) {
      console.error('Erro ao excluir recompensa:', error);
      res.status(500).json({ errorMessage: 'Erro ao excluir recompensa', error: error.message });
    }
  }

  function notFound(request, response) {
    return response.status(404).json({ errorMessage: 'Rota não encontrada' });
  }

  return {
    visualizarRecompensas,
    cadastrarRecompensas,
    atualizarRecompensas,
    excluirRecom,
    notFound,
  };
}

module.exports = recompensasController;