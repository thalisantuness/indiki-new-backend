const { Usuario } = require('../model/Usuarios');
const bcrypt = require('bcrypt');

async function listarUsuarios() {
    return Usuario.findAll();
}

async function listarEmpresas() {
    return Usuario.findAll({
        where: { role: 'empresa' },
        order: [['data_cadastro', 'DESC']]
    });
}

async function criarUsuario(dadosUsuario) {
    const { nome, email, senha, role } = dadosUsuario;

    if (!senha) {
        throw new Error('Senha é obrigatória');
    }

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
        throw new Error('Usuário com este email já existe');
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await Usuario.create({
        nome,
        email,
        senha: senhaHash,
        role: role || 'cliente',
        pontos: 0,
        status: role === 'empresa' ? 'pendente' : 'ativo'
    });

    console.log(`Usuário ${nome} criado com sucesso`);

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

async function tornarUsuarioEmpresa(id) {
    const usuarioExistente = await Usuario.findByPk(id);
    if (!usuarioExistente) {
        throw new Error('Usuário não existe');
    }

    await Usuario.update({
        role: 'empresa',
        status: 'pendente'
    }, {
        where: { usuario_id: id }
    });

    return Usuario.findByPk(id); 
}

async function aprovarEmpresa(id) {
    const usuarioExistente = await Usuario.findByPk(id);
    if (!usuarioExistente) {
        throw new Error('Empresa não existe');
    }

    if (usuarioExistente.role !== 'empresa') {
        throw new Error('Usuário não é uma empresa');
    }

    await Usuario.update({
        status: 'ativo'
    }, {
        where: { usuario_id: id }
    });

    return Usuario.findByPk(id); 
}

async function atualizarDadosEmpresa(usuario_id, dados) {
    const { cnpj, endereco, telefone } = dados;
    const usuarioExistente = await Usuario.findByPk(usuario_id);
    
    if (!usuarioExistente) {
        throw new Error('Usuário não existe');
    }

    if (usuarioExistente.role !== 'empresa') {
        throw new Error('Usuário não é uma empresa');
    }

    await Usuario.update({
        cnpj,
        endereco,
        telefone
    }, {
        where: { usuario_id }
    });

    return Usuario.findByPk(usuario_id);
}
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
    listarEmpresas,
    criarUsuario,
    atualizarUsuario,
    excluirUsuario,
    buscarUsuario,
    tornarUsuarioAdmin,
    tornarUsuarioEmpresa,
    aprovarEmpresa,
    atualizarDadosEmpresa,
    givePoints
};