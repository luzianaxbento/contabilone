const express = require('express');
const { body } = require('express-validator');
const contabilController = require('../controllers/contabilController');
const { verificarToken, verificarPermissao } = require('../middlewares/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(verificarToken);

// Rotas para Plano de Contas
router.get('/plano-contas', contabilController.listarPlanoContas);
router.get('/plano-contas/:id', contabilController.obterContaPorId);

// Rotas para criação e atualização de contas (requer permissão de contador ou admin)
router.use('/plano-contas', verificarPermissao(['CONTADOR', 'ADMIN']));

router.post('/plano-contas', [
  body('codigo').notEmpty().withMessage('Código é obrigatório'),
  body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
  body('tipo').isIn(['ATIVO', 'PASSIVO', 'RECEITA', 'DESPESA', 'RESULTADO']).withMessage('Tipo inválido'),
  body('natureza').isIn(['DEVEDORA', 'CREDORA']).withMessage('Natureza inválida'),
  body('nivel').isInt({ min: 1 }).withMessage('Nível deve ser um número inteiro positivo')
], contabilController.criarConta);

router.put('/plano-contas/:id', [
  body('descricao').optional().notEmpty().withMessage('Descrição não pode ser vazia'),
  body('tipo').optional().isIn(['ATIVO', 'PASSIVO', 'RECEITA', 'DESPESA', 'RESULTADO']).withMessage('Tipo inválido'),
  body('natureza').optional().isIn(['DEVEDORA', 'CREDORA']).withMessage('Natureza inválida'),
  body('nivel').optional().isInt({ min: 1 }).withMessage('Nível deve ser um número inteiro positivo'),
  body('permite_lancamento').optional().isBoolean().withMessage('Permite lançamento deve ser um booleano'),
  body('ativo').optional().isBoolean().withMessage('Ativo deve ser um booleano')
], contabilController.atualizarConta);

// Rotas para Lançamentos Contábeis
router.get('/lancamentos', contabilController.listarLancamentos);
router.get('/lancamentos/:id', contabilController.obterLancamentoPorId);

// Rotas para criação e manipulação de lançamentos (requer permissão específica)
router.post('/lancamentos', [
  body('numero_lancamento').notEmpty().withMessage('Número do lançamento é obrigatório'),
  body('data_lancamento').isDate().withMessage('Data do lançamento deve ser uma data válida'),
  body('data_competencia').isDate().withMessage('Data de competência deve ser uma data válida'),
  body('tipo_lancamento').isIn(['NORMAL', 'ABERTURA', 'ENCERRAMENTO', 'AJUSTE', 'RECLASSIFICACAO']).withMessage('Tipo de lançamento inválido'),
  body('historico').notEmpty().withMessage('Histórico é obrigatório'),
  body('valor').isNumeric().withMessage('Valor deve ser numérico'),
  body('partidas').isArray({ min: 2 }).withMessage('É necessário informar pelo menos duas partidas'),
  body('partidas.*.conta_id').isInt().withMessage('ID da conta deve ser um número inteiro'),
  body('partidas.*.tipo').isIn(['DEBITO', 'CREDITO']).withMessage('Tipo da partida deve ser DEBITO ou CREDITO'),
  body('partidas.*.valor').isNumeric().withMessage('Valor da partida deve ser numérico')
], verificarPermissao(['CONTADOR', 'AUXILIAR', 'ADMIN']), contabilController.criarLancamento);

router.post('/lancamentos/:id/aprovar', verificarPermissao(['CONTADOR', 'ADMIN']), contabilController.aprovarLancamento);

router.post('/lancamentos/:id/rejeitar', [
  body('motivo').notEmpty().withMessage('Motivo da rejeição é obrigatório')
], verificarPermissao(['CONTADOR', 'ADMIN']), contabilController.rejeitarLancamento);

router.post('/lancamentos/:id/estornar', [
  body('motivo').notEmpty().withMessage('Motivo do estorno é obrigatório')
], verificarPermissao(['CONTADOR', 'ADMIN']), contabilController.estornarLancamento);

module.exports = router;
