import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Button,
  TextField,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Visibility as ViewIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { folhaService } from '../../services/api';

const Funcionarios = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [funcionarios, setFuncionarios] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Carregar funcionários ao montar o componente
  useEffect(() => {
    fetchFuncionarios();
  }, []);

  // Buscar funcionários do servidor
  const fetchFuncionarios = async () => {
    try {
      setLoading(true);
      
      // Em um ambiente real, esta chamada seria para um endpoint real
      // Aqui estamos simulando os dados para demonstração
      
      // Simular dados de funcionários
      const funcionariosSimulados = [
        {
          id: 1,
          nome: 'João Silva',
          cpf: '123.456.789-00',
          cargo: 'Contador',
          departamento: 'Contabilidade',
          data_admissao: '2020-01-15',
          salario: 5000.00,
          status: 'ATIVO'
        },
        {
          id: 2,
          nome: 'Maria Oliveira',
          cpf: '987.654.321-00',
          cargo: 'Analista Fiscal',
          departamento: 'Fiscal',
          data_admissao: '2021-03-10',
          salario: 4500.00,
          status: 'ATIVO'
        },
        {
          id: 3,
          nome: 'Pedro Santos',
          cpf: '456.789.123-00',
          cargo: 'Auxiliar Contábil',
          departamento: 'Contabilidade',
          data_admissao: '2022-05-20',
          salario: 3000.00,
          status: 'ATIVO'
        },
        {
          id: 4,
          nome: 'Ana Souza',
          cpf: '789.123.456-00',
          cargo: 'Gerente Financeiro',
          departamento: 'Financeiro',
          data_admissao: '2019-11-05',
          salario: 7000.00,
          status: 'ATIVO'
        },
        {
          id: 5,
          nome: 'Carlos Ferreira',
          cpf: '321.654.987-00',
          cargo: 'Assistente Administrativo',
          departamento: 'Administrativo',
          data_admissao: '2023-01-10',
          salario: 2800.00,
          status: 'ATIVO'
        },
        {
          id: 6,
          nome: 'Juliana Costa',
          cpf: '654.987.321-00',
          cargo: 'Analista de DP',
          departamento: 'Recursos Humanos',
          data_admissao: '2021-07-15',
          salario: 4200.00,
          status: 'ATIVO'
        },
        {
          id: 7,
          nome: 'Roberto Almeida',
          cpf: '159.753.852-00',
          cargo: 'Contador',
          departamento: 'Contabilidade',
          data_admissao: '2020-09-01',
          salario: 5200.00,
          status: 'INATIVO'
        }
      ];
      
      setFuncionarios(funcionariosSimulados);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar funcionários',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Colunas da tabela
  const columns = [
    { 
      field: 'nome', 
      headerName: 'Nome', 
      flex: 1, 
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2, bgcolor: 'folha.main' }}>
            {params.value.charAt(0)}
          </Avatar>
          {params.value}
        </Box>
      )
    },
    { field: 'cpf', headerName: 'CPF', width: 150 },
    { field: 'cargo', headerName: 'Cargo', width: 180 },
    { field: 'departamento', headerName: 'Departamento', width: 180 },
    { 
      field: 'data_admissao', 
      headerName: 'Data Admissão', 
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('pt-BR');
      }
    },
    { 
      field: 'salario', 
      headerName: 'Salário', 
      width: 150,
      valueFormatter: (params) => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(params.value);
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor: params.value === 'ATIVO' ? 'success.light' : 'error.light',
            color: params.value === 'ATIVO' ? 'success.dark' : 'error.dark',
            borderRadius: 1,
            px: 1,
            py: 0.5
          }}
        >
          {params.value === 'ATIVO' ? 'Ativo' : 'Inativo'}
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Visualizar">
            <IconButton 
              size="small" 
              onClick={() => navigate(`/folha/funcionarios/${params.row.id}`)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton 
              size="small" 
              onClick={() => navigate(`/folha/funcionarios/${params.row.id}/editar`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Funcionários
        </Typography>
        
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/dashboard" underline="hover" color="inherit">
            Dashboard
          </MuiLink>
          <MuiLink component={Link} to="/folha" underline="hover" color="inherit">
            Folha
          </MuiLink>
          <Typography color="text.primary">Funcionários</Typography>
        </Breadcrumbs>
        
        <Typography variant="body1" color="text.secondary">
          Gerencie os funcionários da sua empresa.
        </Typography>
      </Box>
      
      {/* Barra de ações */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/folha/funcionarios/novo')}
          sx={{ bgcolor: 'folha.main' }}
        >
          Novo Funcionário
        </Button>
      </Box>
      
      {/* Tabela de funcionários */}
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={funcionarios}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          loading={loading}
          getRowClassName={(params) => 
            params.row.status === 'INATIVO' ? 'row-inactive' : ''
          }
          sx={{
            '& .row-inactive': {
              opacity: 0.6,
            },
          }}
        />
      </Paper>
      
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

export default Funcionarios;
