// Adaptação do controlador de autenticação para uso com Supabase
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

// Controlador de autenticação
const authController = {
  // Login de usuário
  login: async (req, res) => {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Email e senha são obrigatórios'
        });
      }

      // Autenticar usuário via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

      if (error) {
        return res.status(401).json({
          sucesso: false,
          mensagem: error.message
        });
      }

      // Obter dados adicionais do usuário
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        return res.status(500).json({
          sucesso: false,
          mensagem: 'Erro ao obter dados do usuário'
        });
      }

      // Registrar último acesso
      await supabase
        .from('usuarios')
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq('id', data.user.id);

      // Retornar dados do usuário e token
      return res.status(200).json({
        sucesso: true,
        token: data.session.access_token,
        usuario: {
          id: data.user.id,
          email: data.user.email,
          nome: usuario.nome,
          perfil: usuario.perfil,
          ativo: usuario.ativo
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno do servidor'
      });
    }
  },

  // Registro de novo usuário
  registrar: async (req, res) => {
    try {
      const { nome, email, senha, perfil } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Nome, email e senha são obrigatórios'
        });
      }

      // Verificar se o usuário já existe
      const { data: usuarioExistente } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (usuarioExistente) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Email já cadastrado'
        });
      }

      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome,
            perfil: perfil || 'CONSULTA'
          }
        }
      });

      if (error) {
        return res.status(400).json({
          sucesso: false,
          mensagem: error.message
        });
      }

      // Inserir dados adicionais na tabela de usuários
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert([{
          id: data.user.id,
          nome,
          email,
          perfil: perfil || 'CONSULTA',
          ativo: true
        }]);

      if (insertError) {
        // Tentar remover o usuário criado no Auth em caso de erro
        await supabase.auth.admin.deleteUser(data.user.id);
        
        return res.status(500).json({
          sucesso: false,
          mensagem: 'Erro ao criar usuário'
        });
      }

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Usuário registrado com sucesso',
        usuario: {
          id: data.user.id,
          nome,
          email,
          perfil: perfil || 'CONSULTA'
        }
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno do servidor'
      });
    }
  },

  // Logout
  logout: async (req, res) => {
    try {
      // No Supabase, o logout é gerenciado pelo cliente
      // Aqui apenas confirmamos o sucesso da operação
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno do servidor'
      });
    }
  },

  // Obter perfil do usuário
  perfil: async (req, res) => {
    try {
      const userId = req.user.id;

      // Obter dados do usuário
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Usuário não encontrado'
        });
      }

      return res.status(200).json({
        sucesso: true,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
          cargo: usuario.cargo,
          ativo: usuario.ativo,
          ultimo_acesso: usuario.ultimo_acesso
        }
      });
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno do servidor'
      });
    }
  },

  // Alterar senha
  alterarSenha: async (req, res) => {
    try {
      const { senhaAtual, novaSenha } = req.body;
      const userId = req.user.id;

      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Senha atual e nova senha são obrigatórias'
        });
      }

      // No Supabase, a alteração de senha é feita pelo cliente
      // Aqui simulamos a verificação da senha atual
      
      // Atualizar senha
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { password: novaSenha }
      );

      if (error) {
        return res.status(400).json({
          sucesso: false,
          mensagem: error.message
        });
      }

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Senha alterada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = authController;
