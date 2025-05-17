import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Button,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Visibility as ViewIcon,
  Business as BusinessIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { patrimonioService } from '../../services/api';

const Ativos = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ativos, setAtivos] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Carregar ativos ao montar o componente
  useEffect(() => {
    fetchAtivos();
  }, []);

  // Buscar ativos do servidor
  const fetchAtivos = async () => {
    try {
      setLoading(true);
      
      // Em um ambiente real, esta chamada seria para um endpoint real
      // Aqui estamos simulando os dados para demonstração
      
      // Simular dados de ativos
      const ativosSimulados = [
        {
          id: 1,
          codigo: 'COMP001',
          descricao: 'Computador Dell Inspiron',
          categoria: 'Equipamentos de Informática',
          data_aquisicao: '2023-01-15',
          valor_aquisicao: 5000.00,
          valor_atual: 4250.00,
          vida_util: 60,
          taxa_depreciacao: 20,
          localizacao: 'Departamento de Contabilidade',
          status: 'ATIVO'
        },
        {
          id: 2,
          codigo: 'MOV001',
          descricao: 'Mesa de Escritório',
          categoria: 'Móveis e Utensílios',
          data_aquisicao: '2022-05-10',
          valor_aquisicao: 1200.00,
          valor_atual: 1080.00,
          vida_util: 120,
          taxa_depreciacao: 10,
          localizacao: 'Departamento Administrativo',
          status: 'ATIVO'
        },
        {
          id: 3,
          codigo: 'VEIC001',
          descricao: 'Veículo Fiat Strada',
          categoria: 'Veículos',
          data_aquisicao: '2021-11-20',
          valor_aquisicao: 75000.00,
          valor_atual: 60000.00,
          vida_util: 60,
          taxa_depreciacao: 20,
          localizacao: 'Frota',
          status: 'ATIVO'
        },
        {
          id: 4,
          codigo: 'SOFT001',
          descricao: 'Licença Software ERP',
          categoria: 'Software',
          data_aquisicao: '2024-02-01',
          valor_aquisicao: 15000.00,
          valor_atual: 13750.00,
          vida_util: 36,
          taxa_depreciacao: 33.33,
          localizacao: 'TI',
          status: 'ATIVO'
        },
        {
          id: 5,
          codigo: 'COMP002',
          descricao: 'Notebook HP',
          categoria: 'Equipamentos de Informática',
          data_aquisicao: '2022-08-15',
          valor_aquisicao: 4500.00,
          valor_atual: 3375.00,
          vida_util: 60,
          taxa_depreciacao: 20,
          localizacao: 'Departamento Fiscal',
          status: 'ATIVO'
        },
        {
          id: 6,
          codigo: 'MOV002',
          descricao: 'Cadeira Ergonômica',
          categoria: 'Móveis e Utensílios',
          data_aquisicao: '2023-03-10',
          valor_aquisicao: 800.00,
          valor_atual: 720.00,
          vida_util: 120,
          taxa_depreciacao: 10,
          localizacao: 'Departamento de Contabilidade',
          status: 'INATIVO'
        }
      ];
      
      setAtivos(ativosSimulados);
    } catch (error) {
      console.error('Erro ao carregar ativos:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar ativos',
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
    { field: 'codigo', headerName: 'Código', width: 120 },
    { field: 'descricao', headerName: 'Descrição', flex: 1, minWidth: 200 },
    { field: 'categoria', headerName: 'Categoria', width: 200 },
    { 
      field: 'data_aquisicao', 
      headerName: 'Data Aquisição', 
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('pt-BR');
      }
    },
    { 
      field: 'valor_aquisicao', 
      headerName: 'Valor Aquisição', 
      width: 150,
      valueFormatter: (params) => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(params.value);
      }
    },
    { 
      field: 'valor_atual', 
      headerName: 'Valor Atual', 
      width: 150,
      valueFormatter: (params) => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(params.value);
      }
    },
    { field: 'localizacao', headerName: 'Localização', width: 200 },
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
              onClick={() => navigate(`/patrimonio/ativos/${params.row.id}`)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton 
              size="small" 
              onClick={() => navigate(`/patrimonio/ativos/${params.row.id}/editar`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Resumo por categoria
  const resumoPorCategoria = ativos.reduce((acc, ativo) => {
    if (ativo.status === 'ATIVO') {
      if (!acc[ativo.categoria]) {
        acc[ativo.categoria] = {
          quantidade: 0,
          valorTotal: 0
        };
      }
      acc[ativo.categoria].quantidade += 1;
      acc[ativo.categoria].valorTotal += ativo.valor_atual;
    }
    return acc;
  }, {});

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Ativos
        </Typography>
        
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/dashboard" underline="hover" color="inherit">
            Dashboard
          </MuiLink>
          <MuiLink component={Link} to="/patrimonio" underline="hover" color="inherit">
            Patrimônio
          </MuiLink>
          <Typography color="text.primary">Ativos</Typography>
        </Breadcrumbs>
        
        <Typography variant="body1" color="text.secondary">
          Gerencie os ativos da sua empresa.
        </Typography>
      </Box>
      
      {/* Resumo por categoria */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.entries(resumoPorCategoria).map(([categoria, dados]) => (
          <Grid item xs={12} sm={6} md={4} key={categoria}>
            <Card>
              <CardHeader 
                title={categoria}
                titleTypographyProps={{ variant: 'h6' }}
                avatar={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 40,
                      width: 40,
                      borderRadius: 1,
                      backgroundColor: 'patrimonio.light',
                      color: 'patrimonio.main'
                    }}
                  >
                    <BusinessIcon />
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Quantidade
                    </Typography>
                    <Typography variant="h6">
                      {dados.quantidade}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Valor Total
                    </Typography>
                    <Typography variant="h6">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(dados.valorTotal)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Barra de ações */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/patrimonio/ativos/novo')}
          sx={{ bgcolor: 'patrimonio.main' }}
        >
          Novo Ativo
        </Button>
      </Box>
      
      {/* Tabela de ativos */}
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={ativos}
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

export default Ativos;
