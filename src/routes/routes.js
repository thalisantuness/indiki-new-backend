const express = require("express");
const router = express.Router();
router.use(express.json());

const UsuarioController = require("../controllers/usuariosController");
const usuariosController = UsuarioController();

const RecompensasController = require('../controllers/recompensasController');
const recompensasController = RecompensasController();

const SolicitacoesController = require("../controllers/solicitacoesController");
const solicitacoesController = SolicitacoesController();

const ComprasController = require('../controllers/comprasController');
const comprasController = ComprasController();

const RegrasController = require('../controllers/regrasController');
const regrasController = RegrasController();

const authMiddleware = require("../middleware/auth");

// Rotas públicas
router.post('/usuarios/login', usuariosController.logar);
router.post('/usuarios', usuariosController.cadastrar);

// Rotas autenticadas
router.use(authMiddleware);

// Usuários
router.get('/usuarios', usuariosController.visualizarUsuario);
router.put('/usuarios/admin', usuariosController.tornarAdmin);
router.put('/usuarios/empresa', usuariosController.tornarEmpresa);
router.put('/usuarios/empresa/:id/aprovar', usuariosController.aprovarEmpresa);
router.get('/empresas', usuariosController.listarEmpresas);
router.put('/minha-empresa', usuariosController.atualizarDadosEmpresa);
router.put('/usuarios/pontos/:id', usuariosController.givePoints);

// Recompensas
router.post('/recompensas', recompensasController.cadastrarRecompensas);
router.get('/recompensas', recompensasController.visualizarRecompensas);

// Solicitações
router.get('/solicitacoes', solicitacoesController.listarSolicitacoes);
router.post('/solicitacoes', solicitacoesController.criarSolicitacao);
router.put('/solicitacoes/processar/:id', solicitacoesController.processarSolicitacao);

// Compras (substitui indicações)
router.get('/compras', comprasController.listarCompras);
router.get('/compras/:id', comprasController.buscarCompraPorId);
router.post('/compras', comprasController.criarCompra);
router.post('/compras/:compra_id/qrcode', comprasController.gerarQRCodeCompra);
router.post('/compras/validar-qrcode', comprasController.validarQRCode);
router.put('/compras/:id', comprasController.atualizarCompra);
router.delete('/compras/:id', comprasController.excluirCompra);
router.get('/minhas-estatisticas', comprasController.estatisticasEmpresa);

// Regras
router.post('/regras', regrasController.criarRegra);
router.get('/minhas-regras', regrasController.listarRegrasEmpresa);
router.get('/empresas/:empresa_id/regras', regrasController.listarRegrasPorEmpresaId);
router.put('/regras/:regra_id/status', regrasController.ativarDesativarRegra);
router.delete('/regras/:regra_id', regrasController.excluirRegra);
router.post('/regras-padrao', regrasController.criarRegrasPadrao);

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({ errorMessage: 'Rota não encontrada' });
});

module.exports = router;