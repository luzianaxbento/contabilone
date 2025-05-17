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
  Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { fiscalService } from '../../services/api';

const DocumentosFiscais = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [documentos, setDocumentos] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Carregar documentos ao montar o componente
  useEffect(() => {
    fetchDocumentos();
  }, [tabValue]);

  // Buscar documentos do servidor
  const fetchDocumentos = async () => {
    try {
      setLoading(true);
      
      // Em um ambiente real, esta chamada seria para um endpoint real
      // Aqui estamos simulando os dados para demonstração
      const tiposDocumento = ['NFE', 'NFCE', 'CTE', 'NFSE'];
      const tipoAtual = tiposDocumento[tabValue];
      
      // Simular dados de documentos fiscais
      const documentosSimulados = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        tipo_documento: tipoAtual,
        numero: `${1000 + i}`,
        serie: '1',
        chave_acesso: `${tipoAtual}${1234567890123456789012345678901234567890}${i}`,
        data_emissao: new Date(2025, 4, 16 - i).toISOString().split('T')[0],
        valor_total: (1000 + Math.random() * 9000).toFixed(2),
        cnpj_emitente: '00.000.000/0001-00',
        nome_emitente: 'Empresa Modelo',
        cnpj_destinatario: '11.111.111/0001-11',
        nome_destinatario: 'Cliente Exemplo',
        status: ['EMITIDA', 'CANCELADA'][Math.floor(Math.random() * 2)]
      }));
      
      setDocumentos(documentosSimulados);
    } catch (error) {
      console.error('Erro ao carregar documentos fiscais:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar documentos fiscais',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Mudar aba
  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Colunas da tabela
  const columns = [
    { field: 'numero', headerName: 'Número', width: 100 },
    { field: 'serie', headerName: 'Série', width: 80 },
    { 
      field: 'data_emissao', 
      headerName: 'Data Emissão', 
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString('pt-BR');
      }
    },
    { 
      field: 'valor_total', 
      headerName: 'Valor Total', 
      width: 150,
      valueFormatter: (params) => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(params.value);
      }
    },
    { field: 'nome_emitente', headerName: 'Emitente', flex: 1, minWidth: 200 },
    { field: 'nome_destinatario', headerName: 'Destinatário', flex: 1, minWidth: 200 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor: params.value === 'EMITIDA' ? 'success.light' : 'error.light',
            color: params.value === 'EMITIDA' ? 'success.dark' : 'error.dark',
            borderRadius: 1,
            px: 1,
            py: 0.5
          }}
        >
          {params.value === 'EMITIDA' ? 'Emitida' : 'Cancelada'}
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
          <Tooltip title="Visualizar">
            <IconButton 
              size="small" 
              onClick={() => navigate(`/fiscal/documentos/${params.row.id}`)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download XML">
            <IconButton 
              size="small" 
              onClick={() => console.log('Download XML', params.row.id)}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download PDF">
            <IconButton 
              size="small" 
              onClick={() => console.log('Download PDF', params.row.id)}
            >
              <DownloadIcon fontSize="small" color="secondary" />
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
          Documentos Fiscais
        </Typography>
        
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/dashboard" underline="hover" color="inherit">
            Dashboard
          </MuiLink>
          <MuiLink component={Link} to="/fiscal" underline="hover" color="inherit">
            Fiscal
          </MuiLink>
          <Typography color="text.primary">Documentos Fiscais</Typography>
        </Breadcrumbs>
        
        <Typography variant="body1" color="text.secondary">
          Gerencie os documentos fiscais da sua empresa.
        </Typography>
      </Box>
      
      {/* Barra de ações */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mr: 2 }}
            onClick={() => navigate('/fiscal/documentos/novo')}
          >
            Novo Documento
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => console.log('Importar XML')}
          >
            Importar XML
          </Button>
        </Box>
      </Box>
      
      {/* Tabs para tipos de documentos */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleChangeTab}
          indicatorColor="secondary"
          textColor="secondary"
        >
          <Tab label="NF-e" icon={<ReceiptIcon />} iconPosition="start" />
          <Tab label="NFC-e" icon={<ReceiptIcon />} iconPosition="start" />
          <Tab label="CT-e" icon={<ReceiptIcon />} iconPosition="start" />
          <Tab label="NFS-e" icon={<ReceiptIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {/* Tabela de documentos */}
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={documentos}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          loading={loading}
          getRowClassName={(params) => 
            params.row.status === 'CANCELADA' ? 'row-canceled' : ''
          }
          sx={{
            '& .row-canceled': {
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

export default DocumentosFiscais;
