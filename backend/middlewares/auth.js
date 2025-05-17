// Adaptação do middleware de autenticação para uso com Supabase
const supabase = require('../config/supabase');

// Middleware de autenticação
const authMiddleware = async (req, res, next) => {
  try {
    // Verificar se o token foi fornecido
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token de autenticação não fornecido'
      });
    }
    
    // Extrair o token
    const token = authHeader.split(' ')[1];
    
    // Verificar o token com Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token inválido ou expirado'
      });
    }
    
    // Obter dados adicionais do usuário
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userError || !usuario || !usuario.ativo) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado ou inativo'
      });
    }
    
    // Adicionar usuário ao objeto de requisição
    req.user = {
      id: user.id,
      email: user.email,
      nome: usuario.nome,
      perfil: usuario.perfil,
      ativo: usuario.ativo
    };
    
    // Continuar para o próximo middleware ou controlador
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar permissões de administrador
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.perfil === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Acesso negado. Permissão de administrador necessária.'
    });
  }
};

// Middleware para verificar permissões de contador
const contadorMiddleware = (req, res, next) => {
  if (req.user && (req.user.perfil === 'ADMIN' || req.user.perfil === 'CONTADOR')) {
    next();
  } else {
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Acesso negado. Permissão de contador necessária.'
    });
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  contadorMiddleware
};
