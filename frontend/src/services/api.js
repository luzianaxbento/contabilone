import axios from 'axios';

// Configuração base do axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  response => response,
  error => {
    // Tratamento de erro de autenticação
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    return response.data;
  },
  
  obterPerfil: async () => {
    const response = await api.get('/auth/perfil');
    return response.data;
  },
  
  alterarSenha: async (senhaAtual, novaSenha) => {
    const response = await api.post('/auth/alterar-senha', { senhaAtual, novaSenha });
    return response.data;
  },
  
  listarUsuarios: async () => {
    const response = await api.get('/auth/usuarios');
    return response.data;
  },
  
  criarUsuario: async (usuario) => {
    const response = await api.post('/auth/usuarios', usuario);
    return response.data;
  },
  
  atualizarUsuario: async (id, usuario) => {
    const response = await api.put(`/auth/usuarios/${id}`, usuario);
    return response.data;
  },
  
  excluirUsuario: async (id) => {
    const response = await api.delete(`/auth/usuarios/${id}`);
    return response.data;
  }
};

// Serviços do módulo contábil
export const contabilService = {
  // Plano de Contas
  listarPlanoContas: async (filtros = {}) => {
    const response = await api.get('/contabil/plano-contas', { params: filtros });
    return response.data;
  },
  
  obterContaPorId: async (id) => {
    const response = await api.get(`/contabil/plano-contas/${id}`);
    return response.data;
  },
  
  criarConta: async (conta) => {
    const response = await api.post('/contabil/plano-contas', conta);
    return response.data;
  },
  
  atualizarConta: async (id, conta) => {
    const response = await api.put(`/contabil/plano-contas/${id}`, conta);
    return response.data;
  },
  
  // Lançamentos Contábeis
  listarLancamentos: async (filtros = {}) => {
    const response = await api.get('/contabil/lancamentos', { params: filtros });
    return response.data;
  },
  
  obterLancamentoPorId: async (id) => {
    const response = await api.get(`/contabil/lancamentos/${id}`);
    return response.data;
  },
  
  criarLancamento: async (lancamento) => {
    const response = await api.post('/contabil/lancamentos', lancamento);
    return response.data;
  },
  
  aprovarLancamento: async (id) => {
    const response = await api.post(`/contabil/lancamentos/${id}/aprovar`);
    return response.data;
  },
  
  rejeitarLancamento: async (id, motivo) => {
    const response = await api.post(`/contabil/lancamentos/${id}/rejeitar`, { motivo });
    return response.data;
  },
  
  estornarLancamento: async (id, motivo) => {
    const response = await api.post(`/contabil/lancamentos/${id}/estornar`, { motivo });
    return response.data;
  }
};

// Serviços do módulo fiscal
export const fiscalService = {
  // Implementação futura dos serviços do módulo fiscal
  listarDocumentosFiscais: async (filtros = {}) => {
    // Simulação de serviço para documentos fiscais
    return { sucesso: true, documentos: [] };
  }
};

// Serviços do módulo folha
export const folhaService = {
  // Implementação futura dos serviços do módulo folha
  listarFuncionarios: async (filtros = {}) => {
    // Simulação de serviço para funcionários
    return { sucesso: true, funcionarios: [] };
  }
};

// Serviços do módulo patrimônio
export const patrimonioService = {
  // Implementação futura dos serviços do módulo patrimônio
  listarAtivos: async (filtros = {}) => {
    // Simulação de serviço para ativos
    return { sucesso: true, ativos: [] };
  }
};

// Serviços do módulo societário
export const societarioService = {
  // Implementação futura dos serviços do módulo societário
  listarSocios: async (filtros = {}) => {
    // Simulação de serviço para sócios
    return { sucesso: true, socios: [] };
  }
};

export default api;
