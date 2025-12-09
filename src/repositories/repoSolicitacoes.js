const { SolicitacaoRecompensa } = require('../model/SolicitacoesRecompensas');
const { Usuario } = require('../model/Usuarios');
const { Recompensas } = require('../model/Recompensas');

async function getRequests() {
  try {
    return await SolicitacaoRecompensa.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['nome'] },
        { model: Recompensas, as: 'recompensa', attributes: ['nome'] }
      ]
    });
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error);
    throw new Error('Erro ao buscar solicitações');
  }
}

async function listarSolicitacoesPorUsuario(usuario_id) {
  try {
    const solicitacoes = await SolicitacaoRecompensa.findAll({ where: { usuario_id } });
    return solicitacoes;
  } catch (error) {
    console.error('Erro ao listar solicitações por usuário:', error);
    throw new Error('Erro ao listar solicitações por usuário');
  }
}

async function criarSolicitacao(dadosSolicitacao) {
  const { recom_id, status, data_solicitacao, usuario_id} = dadosSolicitacao
  if (!recom_id) {
    throw new Error('O id da recompensa é obrigatório');
  }
  return SolicitacaoRecompensa.create({
    usuario_id,
    recom_id,
    status: dadosSolicitacao.status || 'pendente',
    data_solicitacao: dadosSolicitacao.data_solicitacao || new Date(),
  });
}

async function processarSolicitacao(solicitacao_id, decisao) {
  try {
    const solicitacao = await SolicitacaoRecompensa.findByPk(solicitacao_id);
    if (!solicitacao) return { message: 'Solicitação não encontrada.' };
    if (solicitacao.status !== 'pendente') return { message: 'Essa solicitação já foi processada.' };
    const usuario = await Usuario.findByPk(solicitacao.usuario_id);
    const recompensa = await Recompensas.findByPk(solicitacao.recom_id);
    if (decisao === 'aceita') {
      if (usuario.pontos < recompensa.pontos) return { message: 'Pontos insuficientes.' };
      if (recompensa.estoque <= 0) return { message: 'Recompensa fora de estoque.' };
      solicitacao.status = 'aceita';
      solicitacao.data_resposta = new Date();
      await solicitacao.save();
      usuario.pontos -= recompensa.pontos;
      await usuario.save();
      recompensa.estoque -= 1;
      await recompensa.save();
      return { message: 'Solicitação aceita com sucesso.' };
    } else if (decisao === 'rejeitada') {
      solicitacao.status = 'rejeitada';
      solicitacao.data_resposta = new Date();
      await solicitacao.save();
      return { message: 'Solicitação rejeitada.' };
    }
  } catch (error) {
    console.error('Erro ao processar solicitação:', error);
    throw new Error('Erro ao processar solicitação');
  }
}

async function verSolicitacoesPendentes() {
  try {
    const solicitacoesPendentes = await SolicitacaoRecompensa.findAll({
      where: { status: 'pendente' },
      include: [
        { model: Usuario, attributes: ['nome'] },
        { model: Recompensas, attributes: ['nome'] }
      ]
    });
    return solicitacoesPendentes;
  } catch (error) {
    console.error('Erro ao buscar solicitações pendentes:', error);
    throw new Error('Erro ao buscar solicitações pendentes');
  }
}

module.exports = {
  getRequests,
  criarSolicitacao,
  processarSolicitacao,
  verSolicitacoesPendentes,
  listarSolicitacoesPorUsuario,
};