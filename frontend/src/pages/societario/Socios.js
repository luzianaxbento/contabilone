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
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Visibility as ViewIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { societarioService } from '../../services/api';

const Socios = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [socios, setSocios] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Carregar sócios ao montar o componente
  useEffect(() => {
    fetchSocios();
  }, []);

  // Buscar sócios do servidor
  const fetchSocios = async () => {
    try {
      setLoading(true);
      
      // Em um ambiente real, esta chamada seria para um endpoint real
      // Aqui estamos simulando os dados para demonstração
      
      // Simular dados de sócios
      const sociosSimulados = [
        {
          id: 1,
          nome: 'João da Silva',
          cpf_cnpj: '123.456.789-00',
          tipo: 'PESSOA_FISICA',
          participacao: 40,
          valor_capital: 400000.00,
          data_entrada: '2015-01-10',
          status: 'ATIVO'
        },
        {
          id: 2,
          nome: 'Maria Oliveira',
          cpf_cnpj: '987.654.321-00',
          tipo: 'PESSOA_FISICA',
          participacao: 30,
          valor_capital: 300000.00,
          data_entrada: '2015-01-10',
          status: 'ATIVO'
        },
        {
          id: 3,
          nome: 'Investimentos XYZ Ltda',
          cpf_cnpj: '12.345.678/0001-90',
          tipo: 'PESSOA_JURIDICA',
          participacao: 20,
          valor_capital: 200000.00,
          data_entrada: '2018-05-15',
          status: 'ATIVO'
        },
        {
          id: 4,
          nome: 'Pedro Santos',
          cpf_cnpj: '456.789.123-00',
          tipo: 'PESSOA_FISICA',
          participacao: 10,
          valor_capital: 100000.00,
          data_entrada: '2020-03-20',
          status: 'ATIVO'
        },
        {
          id: 5,
          nome: 'Carlos Ferreira',
          cpf_cnpj: '321.654.987-00',
          tipo: 'PESSOA_FISICA',
          participacao: 5,
          valor_capital: 50000.00,
          data_entrada: '2022-07-10',
          data_saida: '2024-12-15',
          status: 'INATIVO'
        }
      ];
      
      setSocios(sociosSimulados);
    } catch (error) {
      console.error('Erro ao carregar sócios:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar sócios',
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
    { field: 'nome', headerName: 'Nome', flex: 1, minWidth: 200 },
    { field: 'cpf_cnpj', headerName: 'CPF/CNPJ', width: 180 },
    { 
      field: 'tipo', 
      headerName: 'Tipo', 
      width: 150,
      valueFormatter: (params) => {
        return params.value === 'PESSOA_FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica';
      }
    },
    { 
      field: 'participacao', 
      headerName: 'Participação', 
      width: 150,
      valueFormatter: (params) => {
        return `${params.value}%`;
      }
    },
    { 
      field: 'valor_capital', 
      headerName: 'Capital', 
      width: 150,
      valueFormatter: (params) => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(params.value);
      }
    },
    { 
      field: 'data_entrada', 
      headerName: 'Data Entrada', 
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('pt-BR');
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
              onClick={() => navigate(`/societario/socios/${params.row.id}`)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton 
              size="small" 
              onClick={() => navigate(`/societario/socios/${params.row.id}/editar`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Calcular total de capital social
  const totalCapital = socios
    .filter(socio => socio.status === 'ATIVO')
    .reduce((total, socio) => total + socio.valor_capital, 0);

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Sócios
        </Typography>
        
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/dashboard" underline="hover" color="inherit">
            Dashboard
          </MuiLink>
          <MuiLink component={Link} to="/societario" underline="hover" color="inherit">
            Societário
          </MuiLink>
          <Typography color="text.primary">Sócios</Typography>
        </Breadcrumbs>
        
        <Typography variant="body1" color="text.secondary">
          Gerencie os sócios e o capital social da sua empresa.
        </Typography>
      </Box>
      
      {/* Resumo do capital social */}
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title="Capital Social"
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
                backgroundColor: 'societario.light',
                color: 'societario.main'
              }}
            >
              <MonetizationOnIcon />
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Capital Social Total
              </Typography>
              <Typography variant="h5" sx={{ mb: 2 }}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalCapital)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Distribuição do Capital
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sócio</TableCell>
                      <TableCell align="right">Participação</TableCell>
                      <TableCell align="right">Valor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {socios
                      .filter(socio => socio.status === 'ATIVO')
                      .map((socio) => (
                        <TableRow key={socio.id}>
                          <TableCell component="th" scope="row">
                            {socio.nome}
                          </TableCell>
                          <TableCell align="right">{socio.participacao}%</TableCell>
                          <TableCell align="right">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(socio.valor_capital)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Barra de ações */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/societario/socios/novo')}
          sx={{ bgcolor: 'societario.main' }}
        >
          Novo Sócio
        </Button>
      </Box>
      
      {/* Tabela de sócios */}
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={socios}
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

export default Socios;
