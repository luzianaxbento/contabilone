import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../../services/supabase';

const CadastroEmpresas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [empresas, setEmpresas] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEmpresa, setCurrentEmpresa] = useState(null);
  const [formData, setFormData] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    regime_tributario: 'SIMPLES',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
    telefone: '',
    email: '',
    site: '',
    data_fundacao: '',
    ativo: true
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Carregar empresas ao montar o componente
  useEffect(() => {
    fetchEmpresas();
  }, []);

  // Buscar empresas do Supabase
  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('razao_social');
      
      if (error) throw error;
      
      // Se não houver dados, criar dados de exemplo
      if (!data || data.length === 0) {
        // Dados de exemplo para demonstração
        const empresasExemplo = [
          {
            id: 1,
            razao_social: 'Empresa Modelo Ltda',
            nome_fantasia: 'Empresa Modelo',
            cnpj: '12.345.678/0001-90',
            inscricao_estadual: '123456789',
            regime_tributario: 'SIMPLES',
            endereco: 'Rua Exemplo',
            numero: '123',
            bairro: 'Centro',
            cidade: 'São Paulo',
            uf: 'SP',
            cep: '01234-567',
            telefone: '(11) 1234-5678',
            email: 'contato@empresamodelo.com.br',
            ativo: true
          },
          {
            id: 2,
            razao_social: 'Comércio Digital S/A',
            nome_fantasia: 'ComDig',
            cnpj: '98.765.432/0001-10',
            inscricao_estadual: '987654321',
            regime_tributario: 'LUCRO_PRESUMIDO',
            endereco: 'Avenida Comercial',
            numero: '456',
            bairro: 'Jardins',
            cidade: 'São Paulo',
            uf: 'SP',
            cep: '04567-890',
            telefone: '(11) 9876-5432',
            email: 'contato@comdig.com.br',
            ativo: true
          },
          {
            id: 3,
            razao_social: 'Indústria Nacional Ltda',
            nome_fantasia: 'IndNac',
            cnpj: '45.678.901/0001-23',
            inscricao_estadual: '456789012',
            regime_tributario: 'LUCRO_REAL',
            endereco: 'Rodovia Industrial',
            numero: '789',
            bairro: 'Distrito Industrial',
            cidade: 'Campinas',
            uf: 'SP',
            cep: '13087-450',
            telefone: '(19) 3456-7890',
            email: 'contato@indnac.com.br',
            ativo: true
          }
        ];
        
        setEmpresas(empresasExemplo);
      } else {
        setEmpresas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar empresas',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Abrir diálogo para adicionar nova empresa
  const handleAddEmpresa = () => {
    setCurrentEmpresa(null);
    setFormData({
      razao_social: '',
      nome_fantasia: '',
      cnpj: '',
      inscricao_estadual: '',
      inscricao_municipal: '',
      regime_tributario: 'SIMPLES',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: '',
      telefone: '',
      email: '',
      site: '',
      data_fundacao: '',
      ativo: true
    });
    setOpenDialog(true);
  };

  // Abrir diálogo para editar empresa existente
  const handleEditEmpresa = (empresa) => {
    setCurrentEmpresa(empresa);
    setFormData({
      razao_social: empresa.razao_social || '',
      nome_fantasia: empresa.nome_fantasia || '',
      cnpj: empresa.cnpj || '',
      inscricao_estadual: empresa.inscricao_estadual || '',
      inscricao_municipal: empresa.inscricao_municipal || '',
      regime_tributario: empresa.regime_tributario || 'SIMPLES',
      endereco: empresa.endereco || '',
      numero: empresa.numero || '',
      complemento: empresa.complemento || '',
      bairro: empresa.bairro || '',
      cidade: empresa.cidade || '',
      uf: empresa.uf || '',
      cep: empresa.cep || '',
      telefone: empresa.telefone || '',
      email: empresa.email || '',
      site: empresa.site || '',
      data_fundacao: empresa.data_fundacao || '',
      ativo: empresa.ativo !== undefined ? empresa.ativo : true
    });
    setOpenDialog(true);
  };

  // Fechar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Atualizar dados do formulário
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Salvar empresa (criar nova ou atualizar existente)
  const handleSaveEmpresa = async () => {
    try {
      // Validar campos obrigatórios
      if (!formData.razao_social || !formData.cnpj) {
        setSnackbar({
          open: true,
          message: 'Razão social e CNPJ são obrigatórios',
          severity: 'error'
        });
        return;
      }
      
      if (currentEmpresa) {
        // Atualizar empresa existente
        const { data, error } = await supabase
          .from('empresas')
          .update(formData)
          .eq('id', currentEmpresa.id)
          .select();
        
        if (error) throw error;
        
        // Atualizar lista de empresas
        setEmpresas(empresas.map(emp => 
          emp.id === currentEmpresa.id ? { ...emp, ...formData } : emp
        ));
        
        setSnackbar({
          open: true,
          message: 'Empresa atualizada com sucesso',
          severity: 'success'
        });
      } else {
        // Criar nova empresa
        const { data, error } = await supabase
          .from('empresas')
          .insert([formData])
          .select();
        
        if (error) throw error;
        
        // Adicionar nova empresa à lista
        if (data && data[0]) {
          setEmpresas([...empresas, data[0]]);
        } else {
          // Simulação para demonstração
          const newEmpresa = {
            id: empresas.length + 1,
            ...formData
          };
          setEmpresas([...empresas, newEmpresa]);
        }
        
        setSnackbar({
          open: true,
          message: 'Empresa cadastrada com sucesso',
          severity: 'success'
        });
      }
      
      // Fechar diálogo
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar empresa',
        severity: 'error'
      });
    }
  };

  // Excluir empresa
  const handleDeleteEmpresa = async (id) => {
    try {
      // Confirmar exclusão
      if (!window.confirm('Tem certeza que deseja excluir esta empresa?')) {
        return;
      }
      
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remover empresa da lista
      setEmpresas(empresas.filter(emp => emp.id !== id));
      
      setSnackbar({
        open: true,
        message: 'Empresa excluída com sucesso',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir empresa',
        severity: 'error'
      });
    }
  };

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Colunas da tabela
  const columns = [
    { field: 'razao_social', headerName: 'Razão Social', flex: 1, minWidth: 200 },
    { field: 'nome_fantasia', headerName: 'Nome Fantasia', width: 180 },
    { field: 'cnpj', headerName: 'CNPJ', width: 150 },
    { 
      field: 'regime_tributario', 
      headerName: 'Regime Tributário', 
      width: 180,
      valueFormatter: (params) => {
        const regimes = {
          'SIMPLES': 'Simples Nacional',
          'LUCRO_PRESUMIDO': 'Lucro Presumido',
          'LUCRO_REAL': 'Lucro Real',
          'SCP': 'SCP'
        };
        return regimes[params.value] || params.value;
      }
    },
    { field: 'cidade', headerName: 'Cidade', width: 150 },
    { field: 'uf', headerName: 'UF', width: 70 },
    { 
      field: 'ativo', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor: params.value ? 'success.light' : 'error.light',
            color: params.value ? 'success.dark' : 'error.dark',
            borderRadius: 1,
            px: 1,
            py: 0.5
          }}
        >
          {params.value ? 'Ativo' : 'Inativo'}
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button
            size="small"
            onClick={() => handleEditEmpresa(params.row)}
            sx={{ minWidth: 'auto', p: 0.5 }}
          >
            <EditIcon fontSize="small" />
          </Button>
          <Button
            size="small"
            onClick={() => handleDeleteEmpresa(params.row.id)}
            sx={{ minWidth: 'auto', p: 0.5, color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" />
          </Button>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Cadastro de Empresas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie as empresas do sistema
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddEmpresa}
        >
          Nova Empresa
        </Button>
      </Box>
      
      {/* Resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader 
              title="Total de Empresas"
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
                    backgroundColor: 'primary.light',
                    color: 'primary.main'
                  }}
                >
                  <BusinessIcon />
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Typography variant="h4">
                {empresas.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader 
              title="Simples Nacional"
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
                    backgroundColor: 'success.light',
                    color: 'success.main'
                  }}
                >
                  <BusinessIcon />
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Typography variant="h4">
                {empresas.filter(emp => emp.regime_tributario === 'SIMPLES').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader 
              title="Lucro Presumido"
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
                    backgroundColor: 'warning.light',
                    color: 'warning.main'
                  }}
                >
                  <BusinessIcon />
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Typography variant="h4">
                {empresas.filter(emp => emp.regime_tributario === 'LUCRO_PRESUMIDO').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader 
              title="Lucro Real"
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
                    backgroundColor: 'info.light',
                    color: 'info.main'
                  }}
                >
                  <BusinessIcon />
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Typography variant="h4">
                {empresas.filter(emp => emp.regime_tributario === 'LUCRO_REAL').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabela de empresas */}
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={empresas}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentEmpresa ? 'Editar Empresa' : 'Nova Empresa'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="razao_social"
                label="Razão Social"
                value={formData.razao_social}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="nome_fantasia"
                label="Nome Fantasia"
                value={formData.nome_fantasia}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="cnpj"
                label="CNPJ"
                value={formData.cnpj}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="inscricao_estadual"
                label="Inscrição Estadual"
                value={formData.inscricao_estadual}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="inscricao_municipal"
                label="Inscrição Municipal"
                value={formData.inscricao_municipal}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="regime_tributario"
                label="Regime Tributário"
                value={formData.regime_tributario}
                onChange={handleFormChange}
                select
                SelectProps={{ native: true }}
                fullWidth
                required
              >
                <option value="SIMPLES">Simples Nacional</option>
                <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                <option value="LUCRO_REAL">Lucro Real</option>
                <option value="SCP">SCP</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="data_fundacao"
                label="Data de Fundação"
                type="date"
                value={formData.data_fundacao}
                onChange={handleFormChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="ativo"
                label="Status"
                value={formData.ativo ? "ATIVO" : "INATIVO"}
                onChange={(e) => setFormData({
                  ...formData,
                  ativo: e.target.value === "ATIVO"
                })}
                select
                SelectProps={{ native: true }}
                fullWidth
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Endereço
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="endereco"
                label="Endereço"
                value={formData.endereco}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                name="numero"
                label="Número"
                value={formData.numero}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="complemento"
                label="Complemento"
                value={formData.complemento}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="bairro"
                label="Bairro"
                value={formData.bairro}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="cidade"
                label="Cidade"
                value={formData.cidade}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                name="uf"
                label="UF"
                value={formData.uf}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                name="cep"
                label="CEP"
                value={formData.cep}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Contato
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                name="telefone"
                label="Telefone"
                value={formData.telefone}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="site"
                label="Site"
                value={formData.site}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveEmpresa} variant="contained">
            Salvar
          </Button>
        </DialogActions>
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

export default CadastroEmpresas;
