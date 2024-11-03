const { Usuario } = require('../model/Usuarios');
// const { Indicacao } = require('../model/Indicacoes'); 

const bcrypt = require('bcrypt');

// Usuario.hasMany(Indicacao, {
//   foreignKey: 'indicacao_id',
//   as: 'indicacao'
// });

// Indicacao.belongsTo(Usuario, {
//   foreignKey: 'indicacao_id',
//   as: 'indicacao'
// });

async function listarUsuarios() {
    return Usuario.findAll();
}

async function criarUsuario(dadosUsuario) {
    const { nome, email, senha } = dadosUsuario;

    if (!senha) {
        throw new Error('Senha é obrigatória');
    }

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
        throw new Error('Usuário com este email já existe');
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuarioNormal = await Usuario.create({
        nome,
        email,
        senha: senhaHash,
        pontos: 0
    });

    console.log(`Usuário ${nome} criado com sucesso`);

    return usuarioNormal;
}

async function atualizarUsuario(dadosUsuario) {
    const { nome, email, senha } = dadosUsuario;

    const usuarioExistente = await buscarUsuario(email);
    if (!usuarioExistente) {
        throw new Error('Usuário não existe');
    }

    if (senha) {
        dadosUsuario.senha = await bcrypt.hash(senha, 10);
    }

    await Usuario.update({
        nome,
        senha: dadosUsuario.senha,
    }, {
        where: { email }
    });

    return buscarUsuario(email);
}

async function excluirUsuario(email) {
    const usuarioExistente = await buscarUsuario(email);
    if (!usuarioExistente) {
        throw new Error('Usuário não encontrado');
    }

    await Usuario.destroy({ where: { email } });
    console.log(`Usuário com email ${email} excluído com sucesso`);
}

async function buscarUsuario(email) {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
        throw new Error('Usuário não encontrado');
    }
    return usuario;
}

async function tornarUsuarioAdmin(id) {
    const usuarioExistente = await Usuario.findByPk(id);
    if (!usuarioExistente) {
        throw new Error('Usuário não existe');
    }

await Usuario.update({
        role: 'admin'
    }, {
        where: { usuario_id: id }
    });

    return Usuario.findByPk(id); 
}

async function givePoints(id, pontos) {
    const usuarioExistente = await Usuario.findByPk(id);
    if (!usuarioExistente) {
        throw new Error('Usuário não encontrado');
    }

    usuarioExistente.pontos += pontos;
    await usuarioExistente.save();

    return usuarioExistente;
}

module.exports = {
    listarUsuarios,
    criarUsuario,
    atualizarUsuario,
    excluirUsuario,
    buscarUsuario,
    tornarUsuarioAdmin,
    givePoints
};
