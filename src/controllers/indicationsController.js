const indicacaoRepository = require('../repositories/repoIndicacoes');

function indicacaoController() {
    async function listarIndicacoes(req, res) {
        try {
            const indicacoes = await indicacaoRepository.listarIndicacoes();
            res.status(200).json(indicacoes);
        } catch (error) {
            console.error('Erro ao listar indicações:', error);
            res.status(500).json({ error: 'Erro ao listar indicações' });
        }
    }

    async function buscarIndicacaoPorId(req, res) {
        const { id } = req.params;
        try {
            const indicacao = await indicacaoRepository.buscarIndicacaoPorId(id);
            res.status(200).json(indicacao);
        } catch (error) {
            console.error(`Erro ao buscar indicação com ID ${id}:`, error);
            res.status(404).json({ error: `Indicação com ID ${id} não encontrada` });
        }
    }

    async function criarIndicacao(req, res) {
        const { nome, email } = req.body;
        try {
            const novaIndicacao = await indicacaoRepository.criarIndicacao({ nome, email });

         
    

            res.status(201).json(novaIndicacao);
        } catch (error) {
            console.error('Erro ao criar indicação ou enviar e-mail:', error);
            res.status(500).json({ error: 'Erro ao criar indicação ou enviar e-mail' });
        }
    }

    async function atualizarIndicacao(req, res) {
        const { id } = req.params;
        const dadosAtualizados = req.body;
        try {
            const indicacaoAtualizada = await indicacaoRepository.atualizarIndicacao(id, dadosAtualizados);
            res.status(200).json(indicacaoAtualizada);
        } catch (error) {
            console.error(`Erro ao atualizar indicação com ID ${id}:`, error);
            res.status(404).json({ error: `Indicação com ID ${id} não encontrada` });
        }
    }

    async function excluirIndicacao(req, res) {
        const { id } = req.params;
        try {
            await indicacaoRepository.excluirIndicacao(id);
            res.status(204).send();
        } catch (error) {
            console.error(`Erro ao excluir indicação com ID ${id}:`, error);
            res.status(404).json({ error: `Indicação com ID ${id} não encontrada` });
        }
    }

    // async function consolidarSolicitacao(req, res) {
    //     const { id } = req.params;
    //     const { pontosParaAdicionar } = req.body;
    
    //     try {
    //       const pontuacao = await repoSolicitacoes.consolidarSolicitacao(id, pontosParaAdicionar);
    //       res.status(200).json({ message: 'Solicitação consolidada e pontos adicionados com sucesso', pontuacao });
    //     } catch (error) {
    //       console.error('Erro ao consolidar solicitação:', error);
    //       res.status(500).json({ error: 'Não foi possível consolidar a solicitação no momento.' });
    //     }
    //   }

    return {
        listarIndicacoes,
        buscarIndicacaoPorId,
        criarIndicacao,
        atualizarIndicacao,
        excluirIndicacao,
    };
}

module.exports = indicacaoController;
