const repoAgendamentos = require('../repositories/repoAgendamentos');

function AgendamentoController() {
    async function criar(req, res) {
        const { admin_id, data_hora, servico, observacoes } = req.body;
        const { usuario_id: cliente_id, role } = req.user;

        try {
            if (role !== 'cliente') {
                return res.status(403).json({ error: 'Apenas clientes podem criar agendamentos' });
            }

            const agendamento = await repoAgendamentos.criarAgendamento({
                cliente_id,
                admin_id,
                data_hora,
                servico,
                observacoes
            });

            res.status(201).json(agendamento);
        } catch (error) {
            console.error('Erro ao criar agendamento:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async function listar(req, res) {
        const { usuario_id, role } = req.user;

        try {
            const agendamentos = await repoAgendamentos.listarAgendamentosPorUsuario(usuario_id, role);
            res.json(agendamentos);
        } catch (error) {
            console.error('Erro ao listar agendamentos:', error);
            res.status(500).json({ error: 'Erro ao listar agendamentos' });
        }
    }

    async function atualizarStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;
        const { usuario_id, role } = req.user;

        try {
            const agendamento = await repoAgendamentos.atualizarStatusAgendamento(
                id, 
                status, 
                usuario_id, 
                role
            );
            res.json(agendamento);
        } catch (error) {
            console.error('Erro ao atualizar status do agendamento:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async function buscarPorId(req, res) {
        const { id } = req.params;
        const { usuario_id, role } = req.user;

        try {
            const agendamento = await repoAgendamentos.buscarAgendamentoPorId(id);
            
            // Verificar permissão
            if (
                (role === 'cliente' && agendamento.cliente_id !== usuario_id) ||
                (role === 'admin' && agendamento.admin_id !== usuario_id)
            ) {
                return res.status(403).json({ error: 'Você não tem permissão para visualizar este agendamento' });
            }

            res.json(agendamento);
        } catch (error) {
            console.error('Erro ao buscar agendamento:', error);
            res.status(500).json({ error: error.message });
        }
    }

    return {
        criar,
        listar,
        atualizarStatus,
        buscarPorId
    };
}

module.exports = AgendamentoController;