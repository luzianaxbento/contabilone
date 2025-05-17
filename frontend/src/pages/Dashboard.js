import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  LinearProgress,
  Divider,
  useTheme
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import BusinessIcon from '@mui/icons-material/Business';
import { contabilService, fiscalService, folhaService, patrimonioService, societarioService } from '../services/api';
import supabase from '../services/supabase';

// Componente de card de módulo com barra de progresso
const ModuleCard = ({ title, progress, color, secondaryProgress }) => {
  return (
    <Card sx={{ height: '100%', bgcolor: color, color: 'white' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ mb: 1.5 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'white'
              }
            }} 
          />
        </Box>
        {secondaryProgress !== undefined && (
          <Box sx={{ mb: 1.5 }}>
            <LinearProgress 
              variant="determinate" 
              value={secondaryProgress} 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'rgba(255,255,255,0.7)'
                }
              }} 
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Componente de card de cadastro de empresas
const CompaniesCard = ({ count }) => {
  return (
    <Card sx={{ height: '100%', bgcolor: 'rgba(25, 118, 210, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <BusinessIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
      <Typography variant="h6" align="center" gutterBottom>
        Cadastro Empresas
      </Typography>
      <Typography variant="h2" align="center" sx={{ fontWeight: 'bold' }}>
        {count}
      </Typography>
    </Card>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [moduleStatus, setModuleStatus] = useState({
    contabil: { primary: 75, secondary: 60 },
    fiscal: { primary: 82, secondary: 45 },
    folha: { primary: 30, secondary: 65 },
    patrimonio: { primary: 90, secondary: undefined },
    societario: { primary: 68, secondary: 40 }
  });
  const [companiesCount, setCompaniesCount] = useState(32);
  
  // Dados para o gráfico de barras
  const revenueExpenseData = [
    { name: 'jan', receita: 4000, despesa: 2400 },
    { name: 'fev', receita: 3000, despesa: 1398 },
    { name: 'mar', receita: 2000, despesa: 3800 },
    { name: 'abr', receita: 2780, despesa: 3908 },
    { name: 'mai', receita: 1890, despesa: 4800 },
    { name: 'jun', receita: 2390, despesa: 3800 },
  ];
  
  // Dados para o gráfico de pizza
  const expenseDistributionData = [
    { name: 'Administrativo', value: 35 },
    { name: 'Operacional', value: 25 },
    { name: 'Financeiro', value: 20 },
    { name: 'Marketing', value: 10 },
    { name: 'Outros', value: 10 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Carregar dados ao montar o componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Em um ambiente real, estas chamadas seriam para endpoints reais
        // Aqui estamos simulando os dados para demonstração
        
        // Obter contagem de empresas
        const { data: empresas, error } = await supabase
          .from('empresas')
          .select('id', { count: 'exact', head: true });
        
        if (!error && empresas) {
          setCompaniesCount(empresas.length || 32);
        }
        
        // Simular status dos módulos
        // Em um ambiente real, estes dados viriam de APIs
        setModuleStatus({
          contabil: { primary: 75, secondary: 60 },
          fiscal: { primary: 82, secondary: 45 },
          folha: { primary: 30, secondary: 65 },
          patrimonio: { primary: 90, secondary: undefined },
          societario: { primary: 68, secondary: 40 }
        });
        
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Cards de status dos módulos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <ModuleCard 
            title="Contábil" 
            progress={moduleStatus.contabil.primary} 
            secondaryProgress={moduleStatus.contabil.secondary}
            color="#2196f3" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <ModuleCard 
            title="Fiscal" 
            progress={moduleStatus.fiscal.primary} 
            secondaryProgress={moduleStatus.fiscal.secondary}
            color="#4caf50" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <ModuleCard 
            title="Folha" 
            progress={moduleStatus.folha.primary} 
            secondaryProgress={moduleStatus.folha.secondary}
            color="#ffc107" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <ModuleCard 
            title="Patrimônio" 
            progress={moduleStatus.patrimonio.primary} 
            secondaryProgress={moduleStatus.patrimonio.secondary}
            color="#ff5722" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <ModuleCard 
            title="Societário" 
            progress={moduleStatus.societario.primary} 
            secondaryProgress={moduleStatus.societario.secondary}
            color="#673ab7" 
          />
        </Grid>
      </Grid>
      
      {/* Gráficos e card de empresas */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Receitas x Despesas
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={revenueExpenseData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="receita" name="Receita" fill="#2196f3" />
                <Bar dataKey="despesa" name="Despesas" fill="#f44336" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Grid container spacing={3} sx={{ height: '100%' }}>
            <Grid item xs={12} sm={8}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Distribuição de Despesas
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={expenseDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <CompaniesCard count={companiesCount} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
