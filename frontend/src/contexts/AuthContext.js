import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Criação do contexto de autenticação
const AuthContext = createContext();

// Provider do contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Verificar se o usuário está autenticado ao carregar a aplicação
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userStored = JSON.parse(localStorage.getItem('user'));
          if (userStored) {
            setUser(userStored);
            
            // Atualizar dados do usuário
            try {
              const { usuario } = await authService.obterPerfil();
              setUser(usuario);
              localStorage.setItem('user', JSON.stringify(usuario));
            } catch (error) {
              console.error('Erro ao atualizar perfil:', error);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Função para realizar login
  const login = async (email, senha) => {
    try {
      setLoading(true);
      setError(null);
      
      const { token, usuario } = await authService.login(email, senha);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      
      setUser(usuario);
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      setError(error.response?.data?.mensagem || 'Erro ao realizar login');
      return { 
        success: false, 
        message: error.response?.data?.mensagem || 'Erro ao realizar login' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Função para realizar logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  // Função para alterar senha
  const alterarSenha = async (senhaAtual, novaSenha) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.alterarSenha(senhaAtual, novaSenha);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setError(error.response?.data?.mensagem || 'Erro ao alterar senha');
      return { 
        success: false, 
        message: error.response?.data?.mensagem || 'Erro ao alterar senha' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Verificar se o usuário tem determinada permissão
  const hasPermission = (requiredProfiles) => {
    if (!user) return false;
    
    // Admin tem todas as permissões
    if (user.perfil === 'ADMIN') return true;
    
    // Verificar se o perfil do usuário está na lista de perfis permitidos
    return requiredProfiles.includes(user.perfil);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        alterarSenha,
        hasPermission,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;
