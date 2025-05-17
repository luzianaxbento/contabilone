import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tabs,
  Tab,
  TextField,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  GetApp as DownloadIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import supabase from '../../services/supabase';

// Componente de indicador de KPI
const KPICard = ({ title, value, trend, trendValue, color, icon }) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUpIcon sx={{ color: 'success.main' }} />;
    if (trend === 'down') return <TrendingDownIcon sx={{ color: 'error.main' }} />;
    return <TrendingFlatIcon sx={{ color: 'warning.main' }} />;
  };

  return (
    <Card sx={{ bgcolor: color, color: 'white', height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getTrendIcon()}
            <Typography variant="body2" sx={{ ml: 0.5 }}>
              {trendValue}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Componente de gráfico personalizado
const CustomChart = ({ type, data, config }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xAxis} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {config.series.map((serie, index) => (
                <Bar 
                  key={serie.dataKey} 
                  dataKey={serie.dataKey} 
                  name={serie.name} 
                  fill={serie.color || COLORS[index % COLORS.length]} 
                  stackId={config.stacked ? "stack" : undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xAxis} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {config.series.map((serie, index) => (
                <Line 
                  key={serie.dataKey} 
                  type="monotone" 
                  dataKey={serie.dataKey} 
                  name={serie.name} 
                  stroke={serie.color || COLORS[index % COLORS.length]} 
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xAxis} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {config.series.map((serie, index) => (
                <Area 
                  key={serie.dataKey} 
                  type="monotone" 
                  dataKey={serie.dataKey} 
                  name={serie.name} 
                  fill={serie.color || COLORS[index % COLORS.length]} 
                  stroke={serie.color || COLORS[index % COLORS.length]} 
                  fillOpacity={0.6}
                  stackId={config.stacked ? "stack" : undefined}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={config.labelLine !== false}
                outerRadius={config.outerRadius || 100}
                innerRadius={config.innerRadius || 0}
                fill="#8884d8"
                dataKey={config.dataKey}
                nameKey={config.nameKey}
                label={config.showLabels !== false ? ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` : undefined}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey={config.angleAxis} />
              <PolarRadiusAxis />
              {config.series.map((serie, index) => (
                <Radar 
                  key={serie.dataKey} 
                  name={serie.name} 
                  dataKey={serie.dataKey} 
                  stroke={serie.color || COLORS[index % COLORS.length]} 
                  fill={serie.color || COLORS[index % COLORS.length]} 
                  fillOpacity={0.6} 
                />
              ))}
              <Legend />
              <RechartsTooltip />
            </RadarChart>
          </ResponsiveContainer>
        );
      
      case 'treemap':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <Treemap
              data={data}
              dataKey={config.dataKey}
              nameKey={config.nameKey}
              aspectRatio={4/3}
              stroke="#fff"
              fill="#8884d8"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Treemap>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <Typography variant="body1" color="error" align="center">
            Tipo de gráfico não suportado: {type}
          </Typography>
        );
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {config.title}
      </Typography>
      {renderChart()}
    </Box>
  );
};

// Componente principal do módulo de BI
const ModuloBI = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboards, setDashboards] = useState([]);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [period, setPeriod] = useState('month');
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Carregar dashboards ao montar o componente
  useEffect(() => {
    fetchDashboards();
  }, []);

  // Buscar dashboards
  const fetchDashboards = async () => {
    try {
      setLoading(true);
      
      // Em um ambiente real, isso seria uma chamada à API
      // Aqui estamos simulando com dados estáticos
      const mockDashboards = [
        {
          id: 1,
          name: 'Dashboard Financeiro',
          description: 'Visão geral dos indicadores financeiros',
          is_default: true,
          kpis: [
            {
              id: 1,
              title: 'Liquidez',
              value: '1,5',
              trend: 'up',
              trendValue: '12%',
              color: '#26a69a'
            },
            {
              id: 2,
              title: 'Rentabilidade',
              value: '22,5%',
              trend: 'up',
              trendValue: '5%',
              color: '#1976d2'
            },
            {
              id: 3,
              title: 'Endividamento',
              value: '45,2%',
              trend: 'down',
              trendValue: '3%',
              color: '#ef5350'
            }
          ],
          charts: [
            {
              id: 1,
              type: 'bar',
              title: 'Receitas e Despesas Mensais',
              config: {
                xAxis: 'month',
                series: [
                  { dataKey: 'receita', name: 'Receita', color: '#2196f3' },
                  { dataKey: 'despesa', name: 'Despesa', color: '#f44336' }
                ]
              },
              data: [
                { month: 'Jan', receita: 12000, despesa: 8000 },
                { month: 'Fev', receita: 15000, despesa: 10000 },
                { month: 'Mar', receita: 18000, despesa: 12000 },
                { month: 'Abr', receita: 16000, despesa: 9500 },
                { month: 'Mai', receita: 17000, despesa: 11000 },
                { month: 'Jun', receita: 19000, despesa: 13000 }
              ]
            },
            {
              id: 2,
              type: 'pie',
              title: 'Distribuição de Despesas',
              config: {
                dataKey: 'value',
                nameKey: 'name',
                showLabels: true,
                innerRadius: 60,
                outerRadius: 80
              },
              data: [
                { name: 'Pessoal', value: 45, color: '#2196f3' },
                { name: 'Operacional', value: 25, color: '#4caf50' },
                { name: 'Administrativo', value: 15, color: '#ff9800' },
                { name: 'Financeiro', value: 10, color: '#f44336' },
                { name: 'Marketing', value: 5, color: '#9c27b0' }
              ]
            },
            {
              id: 3,
              type: 'line',
              title: 'Tendências Financeiras',
              config: {
                xAxis: 'month',
                series: [
                  { dataKey: 'valor', name: 'Valor', color: '#2196f3' }
                ]
              },
              data: [
                { month: 'Jan', valor: 1.2 },
                { month: 'Fev', valor: 1.8 },
                { month: 'Mar', valor: 2.3 },
                { month: 'Abr', valor: 1.5 },
                { month: 'Mai', valor: 2.1 },
                { month: 'Jun', valor: 2.7 }
              ]
            },
            {
              id: 4,
              type: 'area',
              title: 'Análise de Sazonalidade',
              config: {
                xAxis: 'month',
                series: [
                  { dataKey: 'valor', name: 'Valor', color: '#ff9800' }
                ]
              },
              data: [
                { month: 'Jan', valor: 100 },
                { month: 'Fev', valor: 120 },
                { month: 'Mar', valor: 140 },
                { month: 'Abr', valor: 160 },
                { month: 'Mai', valor: 180 },
                { month: 'Jun', valor: 165 }
              ]
            }
          ]
        },
        {
          id: 2,
          name: 'Dashboard Operacional',
          description: 'Visão geral dos indicadores operacionais',
          is_default: false,
          kpis: [
            {
              id: 1,
              title: 'Produtividade',
              value: '87%',
              trend: 'up',
              trendValue: '5%',
              color: '#26a69a'
            },
            {
              id: 2,
              title: 'Eficiência',
              value: '92%',
              trend: 'up',
              trendValue: '3%',
              color: '#1976d2'
            },
            {
              id: 3,
              title: 'Retrabalho',
              value: '8%',
              trend: 'down',
              trendValue: '2%',
              color: '#ef5350'
            }
          ],
          charts: [
            {
              id: 1,
              type: 'bar',
              title: 'Produção Mensal',
              config: {
                xAxis: 'month',
                series: [
                  { dataKey: 'meta', name: 'Meta', color: '#ff9800' },
                  { dataKey: 'realizado', name: 'Realizado', color: '#4caf50' }
                ]
              },
              data: [
                { month: 'Jan', meta: 100, realizado: 95 },
                { month: 'Fev', meta: 100, realizado: 98 },
                { month: 'Mar', meta: 100, realizado: 102 },
                { month: 'Abr', meta: 100, realizado: 97 },
                { month: 'Mai', meta: 100, realizado: 105 },
                { month: 'Jun', meta: 100, realizado: 110 }
              ]
            },
            {
              id: 2,
              type: 'radar',
              title: 'Indicadores de Desempenho',
              config: {
                angleAxis: 'subject',
                series: [
                  { dataKey: 'value', name: 'Valor', color: '#2196f3' }
                ]
              },
              data: [
                { subject: 'Qualidade', value: 80 },
                { subject: 'Prazo', value: 90 },
                { subject: 'Custo', value: 70 },
                { subject: 'Segurança', value: 95 },
                { subject: 'Inovação', value: 65 }
              ]
            }
          ]
        }
      ];
      
      setDashboards(mockDashboards);
      
      // Definir dashboard padrão
      const defaultDashboard = mockDashboards.find(d => d.is_default) || mockDashboards[0];
      setCurrentDashboard(defaultDashboard);
    } catch (error) {
      console.error('Erro ao buscar dashboards:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dashboards',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Atualizar período
  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
    // Em um ambiente real, isso atualizaria os dados com base no período selecionado
  };

  // Alternar entre dashboards
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setCurrentDashboard(dashboards[newValue]);
  };

  // Alternar modo de edição
  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Atualizar dashboard
  const handleRefreshDashboard = () => {
    setLoading(true);
    
    // Simular atualização de dados
    setTimeout(() => {
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Dashboard atualizado com sucesso',
        severity: 'success'
      });
    }, 1000);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Business Intelligence</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={period}
              onChange={handlePeriodChange}
              label="Período"
            >
              <MenuItem value="day">Diário</MenuItem>
              <MenuItem value="week">Semanal</MenuItem>
              <MenuItem value="month">Mensal</MenuItem>
              <MenuItem value="quarter">Trimestral</MenuItem>
              <MenuItem value="year">Anual</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Atualizar Dashboard">
            <IconButton onClick={handleRefreshDashboard} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={editMode ? "Sair do Modo de Edição" : "Editar Dashboard"}>
            <IconButton onClick={handleToggleEditMode} sx={{ mr: 1 }}>
              {editMode ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Compartilhar Dashboard">
            <IconButton sx={{ mr: 1 }}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Exportar Dashboard">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Tabs para alternar entre dashboards */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {dashboards.map((dashboard, index) => (
            <Tab key={dashboard.id} label={dashboard.name} />
          ))}
          {editMode && (
            <Tab
              icon={<AddIcon />}
              iconPosition="start"
              label="Novo Dashboard"
            />
          )}
        </Tabs>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : currentDashboard ? (
        <>
          {/* KPIs */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {currentDashboard.kpis.map((kpi) => (
              <Grid item xs={12} md={4} key={kpi.id}>
                <KPICard
                  title={kpi.title}
                  value={kpi.value}
                  trend={kpi.trend}
                  trendValue={kpi.trendValue}
                  color={kpi.color}
                />
              </Grid>
            ))}
          </Grid>
          
          {/* Gráficos */}
          <Grid container spacing={3}>
            {currentDashboard.charts.map((chart) => (
              <Grid item xs={12} md={chart.type === 'pie' || chart.type === 'radar' ? 6 : 12} lg={6} key={chart.id}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <CustomChart
                    type={chart.type}
                    data={chart.data}
                    config={{ ...chart.config, title: chart.title }}
                  />
                </Paper>
              </Grid>
            ))}
            
            {editMode && (
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed',
                    borderColor: 'divider',
                    bgcolor: 'background.default'
                  }}
                >
                  <AddIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Adicionar Gráfico
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      ) : (
        <Typography variant="body1" color="textSecondary" align="center">
          Nenhum dashboard disponível
        </Typography>
      )}
      
      {/* Snackbar para mensagens */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModuloBI;
