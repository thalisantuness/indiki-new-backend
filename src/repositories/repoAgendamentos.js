const { Agendamento } = require('../model/Agendamentos');
const { Usuario } = require('../model/Usuarios');

async function criarAgendamento(dadosAgendamento) {
    const { cliente_id, admin_id, data_hora, servico, observacoes } = dadosAgendamento;

    // Verificar se o admin existe e é realmente um admin
    const admin = await Usuario.findByPk(admin_id);
    if (!admin || admin.role !== 'admin') {
        throw new Error('Administrador não encontrado ou inválido');
    }

    // Verificar se o cliente existe
    const cliente = await Usuario.findByPk(cliente_id);
    if (!cliente) {
        throw new Error('Cliente não encontrado');
    }

    // Verificar conflito de horário
    const agendamentoConflitante = await Agendamento.findOne({
        where: {
            admin_id,
            data_hora: data_hora,
            status: ['pendente', 'confirmado']
        }
    });

    if (agendamentoConflitante) {
        throw new Error('Já existe um agendamento para este horário');
    }

    return Agendamento.create({
        cliente_id,
        admin_id,
        data_hora,
        servico,
        observacoes,
        status: 'pendente'
    });
}

async function listarAgendamentosPorUsuario(usuario_id, role) {
    if (role === 'admin') {
        return Agendamento.findAll({ 
            where: { admin_id: usuario_id },
            include: [{
                model: Usuario,
                as: 'cliente',
                attributes: ['nome', 'email']
            }]
        });
    } else {
        return Agendamento.findAll({ 
            where: { cliente_id: usuario_id },
            include: [{
                model: Usuario,
                as: 'admin',
                attributes: ['nome', 'email']
            }]
        });
    }
}

async function atualizarStatusAgendamento(id, novoStatus, usuario_id, role) {
    const agendamento = await Agendamento.findByPk(id);
    
    if (!agendamento) {
        throw new Error('Agendamento não encontrado');
    }

    // Verificar permissões
    if (role === 'cliente' && agendamento.cliente_id !== usuario_id) {
        throw new Error('Você não tem permissão para alterar este agendamento');
    }

    if (role === 'admin' && agendamento.admin_id !== usuario_id) {
        throw new Error('Você não tem permissão para alterar este agendamento');
    }

    agendamento.status = novoStatus;
    await agendamento.save();

    return agendamento;
}

async function buscarAgendamentoPorId(id) {
    const agendamento = await Agendamento.findByPk(id, {
        include: [
            {
                model: Usuario,
                as: 'cliente',
                attributes: ['nome', 'email']
            },
            {
                model: Usuario,
                as: 'admin',
                attributes: ['nome', 'email']
            }
        ]
    });

    if (!agendamento) {
        throw new Error('Agendamento não encontrado');
    }

    return agendamento;
}

module.exports = {
    criarAgendamento,
    listarAgendamentosPorUsuario,
    atualizarStatusAgendamento,
    buscarAgendamentoPorId
};