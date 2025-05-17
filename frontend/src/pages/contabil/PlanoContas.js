import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { contabilService } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

const PlanoContas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contas, setContas] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedConta, setSelectedConta] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Carregar contas ao montar o componente
  useEffect(() => {
    fetchContas();
  }, []);

  // Buscar contas do servidor
  const fetchContas = async () => {
    try {
      setLoading(true);
      const response = await contabilService.listarPlanoContas();
      if (response.sucesso) {
        setContas(response.contas);
      }
    } catch (error) {
      console.error('Erro ao carregar plano de contas:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar plano de contas',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Formik para formulário de conta
  const formik = useFormik({
    initialValues: {
      codigo: '',
      descricao: '',
      tipo: 'ATIVO',
      natureza: 'DEVEDORA',
      nivel: 1,
      conta_pai_id: '',
      permite_lancamento: false
    },
    validationSchema: Yup.object({
      codigo: Yup.string()
        .required('Código é obrigatório'),
      descricao: Yup.string()
        .required('Descrição é obrigatória'),
      tipo: Yup.string()
        .oneOf(['ATIVO', 'PASSIVO', 'RECEITA', 'DESPESA', 'RESULTADO'], 'Tipo inválido')
        .required('Tipo é obrigatório'),
      natureza: Yup.string()
        .oneOf(['DEVEDORA', 'CREDORA'], 'Natureza inválida')
        .required('Natureza é obrigatória'),
      nivel: Yup.number()
        .min(1, 'Nível deve ser maior que 0')
        .required('Nível é obrigatório')
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        if (selectedConta) {
          // Atualizar conta existente
          const response = await contabilService.atualizarConta(selectedConta.id, values);
          if (response.sucesso) {
            setSnackbar({
              open: true,
              message: 'Conta atualizada com sucesso',
              severity: 'success'
            });
            fetchContas();
          }
        } else {
          // Criar nova conta
          const response = await contabilService.criarConta(values);
          if (response.sucesso) {
            setSnackbar({
              open: true,
              message: 'Conta criada com sucesso',
              severity: 'success'
            });
            fetchContas();
          }
        }
        
        handleCloseDialog();
      } catch (error) {
        console.error('Erro ao salvar conta:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.mensagem || 'Erro ao salvar conta',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  });

  // Abrir diálogo para nova conta
  const handleOpenNewDialog = () => {
    setSelectedConta(null);
    formik.resetForm();
    setOpenDialog(true);
  };

  // Abrir diálogo para editar conta
  const handleOpenEditDialog = (conta) => {
    setSelectedConta(conta);
    formik.setValues({
      codigo: conta.codigo,
      descricao: conta.descricao,
      tipo: conta.tipo,
      natureza: conta.natureza,
      nivel: conta.nivel,
      conta_pai_id: conta.conta_pai_id || '',
      permite_lancamento: conta.permite_lancamento
    });
    setOpenDialog(true);
  };

  // Fechar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
    formik.resetForm();
  };

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Colunas da tabela
  const columns = [
    { field: 'codigo', headerName: 'Código', width: 150 },
    { field: 'descricao', headerName: 'Descrição', flex: 1, minWidth: 200 },
    { 
      field: 'tipo', 
      headerName: 'Tipo', 
      width: 150,
      valueFormatter: (params) => {
        const tipos = {
          'ATIVO': 'Ativo',
          'PASSIVO': 'Passivo',
          'RECEITA': 'Receita',
          'DESPESA': 'Despesa',
          'RESULTADO': 'Resultado'
        };
        return tipos[params.value] || params.value;
      }
    },
    { 
      field: 'natureza', 
      headerName: 'Natureza', 
      width: 150,
      valueFormatter: (params) => {
        return params.value === 'DEVEDORA' ? 'Devedora' : 'Credora';
      }
    },
    { field: 'nivel', headerName: 'Nível', width: 100 },
    { 
      field: 'permite_lancamento', 
      headerName: 'Permite Lançamento', 
      width: 180,
      type: 'boolean'
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Visualizar">
            <IconButton 
              size="small" 
              onClick={() => navigate(`/contabil/plano-contas/${params.row.id}`)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton 
              size="small" 
              onClick={() => handleOpenEditDialog(params.row)}
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
          Plano de Contas
        </Typography>
        
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/dashboard" underline="hover" color="inherit">
            Dashboard
          </MuiLink>
          <MuiLink component={Link} to="/contabil" underline="hover" color="inherit">
            Contábil
          </MuiLink>
          <Typography color="text.primary">Plano de Contas</Typography>
        </Breadcrumbs>
        
        <Typography variant="body1" color="text.secondary">
          Gerencie o plano de contas da sua empresa.
        </Typography>
      </Box>
      
      {/* Barra de ações */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenNewDialog}
        >
          Nova Conta
        </Button>
      </Box>
      
      {/* Tabela de contas */}
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={contas}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          loading={loading}
          getRowClassName={(params) => 
            !params.row.ativo ? 'row-inactive' : ''
          }
          sx={{
            '& .row-inactive': {
              opacity: 0.6,
            },
          }}
        />
      </Paper>
      
      {/* Diálogo de formulário */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {selectedConta ? 'Editar Conta' : 'Nova Conta'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  id="codigo"
                  name="codigo"
                  label="Código"
                  value={formik.values.codigo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.codigo && Boolean(formik.errors.codigo)}
                  helperText={formik.touched.codigo && formik.errors.codigo}
                  disabled={selectedConta !== null}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  id="descricao"
                  name="descricao"
                  label="Descrição"
                  value={formik.values.descricao}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.descricao && Boolean(formik.errors.descricao)}
                  helperText={formik.touched.descricao && formik.errors.descricao}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="tipo-label">Tipo</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="tipo"
                    name="tipo"
                    value={formik.values.tipo}
                    onChange={formik.handleChange}
                    label="Tipo"
                  >
                    <MenuItem value="ATIVO">Ativo</MenuItem>
                    <MenuItem value="PASSIVO">Passivo</MenuItem>
                    <MenuItem value="RECEITA">Receita</MenuItem>
                    <MenuItem value="DESPESA">Despesa</MenuItem>
                    <MenuItem value="RESULTADO">Resultado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="natureza-label">Natureza</InputLabel>
                  <Select
                    labelId="natureza-label"
                    id="natureza"
                    name="natureza"
                    value={formik.values.natureza}
                    onChange={formik.handleChange}
                    label="Natureza"
                  >
                    <MenuItem value="DEVEDORA">Devedora</MenuItem>
                    <MenuItem value="CREDORA">Credora</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  id="nivel"
                  name="nivel"
                  label="Nível"
                  type="number"
                  value={formik.values.nivel}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.nivel && Boolean(formik.errors.nivel)}
                  helperText={formik.touched.nivel && formik.errors.nivel}
                  margin="normal"
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="conta-pai-label">Conta Pai</InputLabel>
                  <Select
                    labelId="conta-pai-label"
                    id="conta_pai_id"
                    name="conta_pai_id"
                    value={formik.values.conta_pai_id}
                    onChange={formik.handleChange}
                    label="Conta Pai"
                  >
                    <MenuItem value="">Nenhuma (Conta Raiz)</MenuItem>
                    {contas
                      .filter(conta => !selectedConta || conta.id !== selectedConta.id)
                      .map(conta => (
                        <MenuItem key={conta.id} value={conta.id}>
                          {conta.codigo} - {conta.descricao}
                        </MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="permite-lancamento-label">Permite Lançamento</InputLabel>
                  <Select
                    labelId="permite-lancamento-label"
                    id="permite_lancamento"
                    name="permite_lancamento"
                    value={formik.values.permite_lancamento}
                    onChange={formik.handleChange}
                    label="Permite Lançamento"
                  >
                    <MenuItem value={true}>Sim</MenuItem>
                    <MenuItem value={false}>Não</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={formik.isSubmitting || loading}
            >
              {formik.isSubmitting || loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
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

export default PlanoContas;
