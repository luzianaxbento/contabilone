const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { verificarToken, verificarPermissao } = require('../middlewares/auth');

const router = express.Router();

// Rota de login
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
], authController.login);

// Rotas protegidas por autenticação
router.use(verificarToken);

// Obter perfil do usuário logado
router.get('/perfil', authController.obterPerfil);

// Alterar senha do usuário logado
router.post('/alterar-senha', [
  body('senhaAtual').isLength({ min: 6 }).withMessage('Senha atual deve ter no mínimo 6 caracteres'),
  body('novaSenha').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres')
], authController.alterarSenha);

// Rotas de administração de usuários (apenas para administradores)
router.use(verificarPermissao(['ADMIN']));

// Listar todos os usuários
router.get('/usuarios', authController.listarUsuarios);

// Criar novo usuário
router.post('/usuarios', [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('perfil').isIn(['ADMIN', 'CONTADOR', 'AUXILIAR', 'GERENTE', 'CONSULTA']).withMessage('Perfil inválido')
], authController.criarUsuario);

// Atualizar usuário
router.put('/usuarios/:id', [
  body('nome').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('senha').optional().isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('perfil').optional().isIn(['ADMIN', 'CONTADOR', 'AUXILIAR', 'GERENTE', 'CONSULTA']).withMessage('Perfil inválido'),
  body('ativo').optional().isBoolean().withMessage('Ativo deve ser um booleano')
], authController.atualizarUsuario);

// Excluir usuário
router.delete('/usuarios/:id', authController.excluirUsuario);

module.exports = router;
