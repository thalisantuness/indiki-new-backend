const express = require("express");
const router = express.Router();
router.use(express.json());

const UsuarioController = require("../controllers/usuariosController");
const usuariosController = UsuarioController();

const RecompensasController = require('../controllers/recompensasController');
const recompensasController = RecompensasController();

const SolicitacoesController = require("../controllers/solicitacoesController");
const solicitacoesController = SolicitacoesController();

const IndicacaoController = require('../controllers/indicationsController');
const indicacaoController = IndicacaoController();

const authMiddleware = require("../middleware/auth")


router.get('/usuarios', usuariosController.visualizarUsuario);
router.post('/usuarios', usuariosController.cadastrar); 
// router.delete('/usuarios/:email', usuariosController.excluir); 
router.post('/usuarios/login', usuariosController.logar); 


router.use(authMiddleware);
router.put('/usuarios/admin', authMiddleware, usuariosController.tornarAdmin);
router.put('/usuarios/pontos/:id', authMiddleware, usuariosController.givePoints);

router.post('/recompensas', authMiddleware, recompensasController.cadastrarRecompensas);
router.get('/recompensas', authMiddleware, recompensasController.visualizarRecompensas);

// router.get('/recompensas/:recom_id', recompensasController.localizarRecompensas);
// router.put('/recompensas/:recom_id', recompensasController.atualizarRecompensas);
// router.delete('/recompensas/:recom_id', recompensasController.excluirRecom);

router.get('/solicitacoes', authMiddleware, solicitacoesController.listarSolicitacoes);
router.post('/solicitacoes', authMiddleware, solicitacoesController.criarSolicitacao); 
router.put('/solicitacoes/processar/:id', authMiddleware, solicitacoesController.processarSolicitacao);

router.post('/indicacoes', authMiddleware,indicacaoController.criarIndicacao);
router.get('/indicacoes', indicacaoController.listarIndicacoes);

// router.get('/solicitacoes/:id', solicitacoesController.buscarSolicitacaoPorId); 
// router.put('/solicitacoes/status/:id', solicitacoesController.atualizarStatusSolicitacao); 
// router.put('/solicitacoes/consolidar/:id', solicitacoesController.consolidarSolicitacao);

// router.get('/indicacoes', indicacaoController.listarIndicacoes);
// router.get('/indicacoes/:id', indicacaoController.buscarIndicacaoPorId);

// router.put('/indicacoes/:id', indicacaoController.atualizarIndicacao);
// router.delete('/indicacoes/:id', indicacaoController.excluirIndicacao);

router.use('*', (req, res) => {
  res.status(404).json({ errorMessage: 'Rota não encontrada' });
});

module.exports = router;
