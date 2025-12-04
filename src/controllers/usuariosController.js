const { Usuario } = require('../model/Usuarios');
const repoUsuarios = require('../repositories/repoUsuarios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.json');

function UsuarioController() {
  // ==================== FUNÇÕES ORIGINAIS ====================

  async function visualizarUsuario(req, res) {
    try {
      const usuarios = await repoUsuarios.listarUsuarios();
      if (usuarios.length === 0) {
        return res.status(404).json({ error: 'Nenhum usuário encontrado' });
      }
      res.json(usuarios);
    } catch (error) {
      console.error('Erro ao obter usuários:', error);
      res.status(500).json({ error: 'Erro ao obter usuários' });
    }
  }

  async function cadastrar(req, res) {
    const { nome, email, senha } = req.body;
    try {    
      await repoUsuarios.criarUsuario({ nome, email, senha });
      res.json({ message: `Usuário ${nome} cadastrado com sucesso` });
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      res.status(500).json({ errorMessage: 'Erro ao cadastrar usuário', error: error.message });
    }
  }

  async function excluir(req, res) {
    const { email } = req.params;

    try {
      const numRegistrosExcluidos = await repoUsuarios.excluirUsuario(email);
      if (numRegistrosExcluidos === 0) {
        res.status(404).json({ message: `Usuário ${email} não encontrado` });
      } else {
        res.json({ message: `Usuário ${email} excluído com sucesso` });
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      res.status(500).json({ errorMessage: 'Erro ao excluir usuário', error: error.message });
    }
  }

  async function tornarAdmin(req, res) {
    const { id } = req.body;
    try {
        const usuarioAtualizado = await repoUsuarios.tornarUsuarioAdmin(id);
        res.json({ 
          message: `Usuário com ID ${id} agora é administrador`, 
          usuario: usuarioAtualizado 
        });
    } catch (error) {
        console.error('Erro ao atualizar usuário para admin:', error);
        res.status(500).json({ 
          errorMessage: 'Erro ao atualizar usuário para admin', 
          error: error.message 
        });
    }
  }

  async function logar(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
      }

      const user = await Usuario.findOne({ where: { email: email } });
  
      if (!user) {
        return res.status(401).json({ message: 'Email não encontrado.' });
      }

      const isMatch = await bcrypt.compare(senha, user.senha);

      if (!isMatch) {
        return res.status(401).json({ message: 'Senha incorreta.' });
      } 

      const token = jwt.sign({ 
        usuario_id: user.usuario_id, 
        role: user.role, 
      }, authConfig.secret, {
        expiresIn: 86400,
      });
      
      res.send({user, token});
    
    } catch (error) {
        console.error('Erro ao autenticar usuário:', error);
        res.status(500).json({ 
          errorMessage: 'Erro ao autenticar usuário', 
          error: error.message 
        });
    }
  }

  async function givePoints(req, res) {
    const { id } = req.params; 
    const { pontos } = req.body; 

    try {
        const usuarioAtualizado = await repoUsuarios.givePoints(id, pontos);
        res.json({ 
          message: `Pontos adicionados com sucesso ao usuário ${usuarioAtualizado.nome}`, 
          usuario: usuarioAtualizado 
        });
    } catch (error) {
        console.error('Erro ao adicionar pontos:', error);
        res.status(500).json({ 
          errorMessage: 'Erro ao adicionar pontos', 
          error: error.message 
        });
    }
  }

  // ==================== FUNÇÕES NOVAS (EMPRESA) ====================

  async function tornarEmpresa(req, res) {
    const { id } = req.body;
    const { usuario_id, role } = req.user;

    if (role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem tornar usuários em empresas' });
    }

    try {
      const usuarioAtualizado = await repoUsuarios.tornarUsuarioEmpresa(id);
      res.json({ 
        message: `Usuário com ID ${id} agora é uma empresa`, 
        usuario: usuarioAtualizado 
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário para empresa:', error);
      res.status(500).json({ 
        errorMessage: 'Erro ao atualizar usuário para empresa', 
        error: error.message 
      });
    }
  }

  async function aprovarEmpresa(req, res) {
    const { id } = req.params;
    const { usuario_id, role } = req.user;

    if (role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem aprovar empresas' });
    }

    try {
      const usuarioAtualizado = await repoUsuarios.aprovarEmpresa(id);
      res.json({ 
        message: `Empresa com ID ${id} aprovada com sucesso`, 
        usuario: usuarioAtualizado 
      });
    } catch (error) {
      console.error('Erro ao aprovar empresa:', error);
      res.status(500).json({ 
        errorMessage: 'Erro ao aprovar empresa', 
        error: error.message 
      });
    }
  }

  async function listarEmpresas(req, res) {
    const { usuario_id, role } = req.user;

    if (role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem listar empresas' });
    }

    try {
      const empresas = await repoUsuarios.listarEmpresas();
      res.json(empresas);
    } catch (error) {
      console.error('Erro ao listar empresas:', error);
      res.status(500).json({ error: 'Erro ao listar empresas' });
    }
  }

  async function atualizarDadosEmpresa(req, res) {
    const { cnpj, endereco, telefone } = req.body;
    const { usuario_id, role } = req.user;

    if (role !== 'empresa') {
      return res.status(403).json({ error: 'Apenas empresas podem atualizar dados comerciais' });
    }

    try {
      const usuarioAtualizado = await repoUsuarios.atualizarDadosEmpresa(usuario_id, { cnpj, endereco, telefone });
      res.json({ 
        message: 'Dados da empresa atualizados com sucesso', 
        usuario: usuarioAtualizado 
      });
    } catch (error) {
      console.error('Erro ao atualizar dados da empresa:', error);
      res.status(500).json({ 
        errorMessage: 'Erro ao atualizar dados da empresa', 
        error: error.message 
      });
    }
  }

  // ==================== RETORNO DO CONTROLLER ====================

  return {
    // Funções originais
    visualizarUsuario,
    cadastrar, 
    excluir,
    tornarAdmin,
    logar,
    givePoints,
    
    // Funções novas (empresa)
    tornarEmpresa,
    aprovarEmpresa,
    listarEmpresas,
    atualizarDadosEmpresa,
  };
}

module.exports = UsuarioController;