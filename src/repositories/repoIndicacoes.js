const { Indicacao } = require('../model/Indicacoes');
const transporter = require('../utils/email');

async function listarIndicacoes() {
    return Indicacao.findAll();
}

async function buscarIndicacaoPorId(id) {
    const indicacao = await Indicacao.findByPk(id);
    if (!indicacao) {
        throw new Error(`Indicação com ID ${id} não encontrada`);
    }
    return indicacao;
}

async function criarIndicacao(dadosIndicacao) {
    const { nome, email } = dadosIndicacao;

    if (!nome || !email) {
        throw new Error('Nome e email da indicação são obrigatórios');
    }

    try {
        const novaIndicacao = await Indicacao.create({ nome, email });
   
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Convite para o App Indiki',
            text: `Olá, ${nome}! Você foi indicado a experimentar o nosso aplicativo. Participe, indique amigos e ganhe recompensas.`,
        };

    
        await transporter.sendMail(mailOptions);
        console.log(`E-mail enviado para ${email}`);

        return novaIndicacao;
    } catch (error) {
        console.error('Erro ao criar indicação ou enviar e-mail:', error);
        throw new Error('Erro ao criar indicação ou enviar e-mail');
    }
}

async function atualizarIndicacao(id, dadosAtualizados) {
    const indicacao = await buscarIndicacaoPorId(id);

    if (!indicacao) {
        throw new Error(`Indicação com ID ${id} não encontrada`);
    }

    await Indicacao.update(dadosAtualizados, {
        where: { indicacao_id: id },
    });

    return buscarIndicacaoPorId(id);
}

async function excluirIndicacao(id) {
    const indicacao = await buscarIndicacaoPorId(id);

    if (!indicacao) {
        throw new Error(`Indicação com ID ${id} não encontrada`);
    }

    await Indicacao.destroy({ where: { indicacao_id: id } });
    console.log(`Indicação com ID ${id} excluída com sucesso`);
}

module.exports = {
    listarIndicacoes,
    buscarIndicacaoPorId,
    criarIndicacao,
    atualizarIndicacao,
    excluirIndicacao,
};
