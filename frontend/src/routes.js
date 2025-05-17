import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import CadastroEmpresas from './pages/cadastro/CadastroEmpresas';
import PlanoContas from './pages/contabil/PlanoContas';
import DocumentosFiscais from './pages/fiscal/DocumentosFiscais';
import Funcionarios from './pages/folha/Funcionarios';
import Ativos from './pages/patrimonio/Ativos';
import Socios from './pages/societario/Socios';
import GeradorRelatorios from './pages/relatorios/GeradorRelatorios';
import ModuloBI from './pages/bi/ModuloBI';

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Se estiver carregando, mostra nada ou um spinner
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  // Se não estiver autenticado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Se estiver autenticado, renderiza o conteúdo
  return children;
};

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<Login />} />
          
          {/* Rotas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="cadastro/empresas" element={<CadastroEmpresas />} />
            <Route path="contabil" element={<PlanoContas />} />
            <Route path="fiscal" element={<DocumentosFiscais />} />
            <Route path="folha" element={<Funcionarios />} />
            <Route path="patrimonio" element={<Ativos />} />
            <Route path="societario" element={<Socios />} />
            <Route path="relatorios" element={<GeradorRelatorios />} />
            <Route path="bi" element={<ModuloBI />} />
          </Route>
          
          {/* Rota para qualquer outro caminho */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRoutes;
