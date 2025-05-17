import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Divider,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  Remove as RemoveIcon,
  DragIndicator as DragIcon,
  Save as SaveIcon,
  GetApp as ExportIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  GroupWork as GroupIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from '../../contexts/AuthContext';
import supabase from '../../services/supabase';

const GeradorRelatorios = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableFields, setTableFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [filters, setFilters] = useState([]);
  const [groupBy, setGroupBy] = useState([]);
  const [orderBy, setOrderBy] = useState([]);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [savedReports, setSavedReports] = useState([]);
  const [loadReportDialogOpen, setLoadReportDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Carregar tabelas disponíveis ao montar o componente
  useEffect(() => {
    fetchTables();
    fetchSavedReports();
  }, []);

  // Buscar tabelas disponíveis
  const fetchTables = async () => {
    try {
      setLoading(true);
      
      // Em um ambiente real, isso seria uma chamada à API
      // Aqui estamos simulando com dados estáticos
      const mockTables = [
        { id: 1, name: 'clientes', display_name: 'Clientes', schema: 'public' },
        { id: 2, name: 'fornecedores', display_name: 'Fornecedores', schema: 'public' },
        { id: 3, name: 'lancamentos', display_name: 'Lançamentos', schema: 'public' },
        { id: 4, name: 'notas_fiscais', display_name: 'Notas Fiscais', schema: 'public' },
        { id: 5, name: 'plano_contas', display_name: 'Plano de Contas', schema: 'public' },
        { id: 6, name: 'funcionarios', display_name: 'Funcionários', schema: 'public' },
        { id: 7, name: 'ativos', display_name: 'Ativos', schema: 'public' },
        { id: 8, name: 'socios', display_name: 'Sócios', schema: 'public' }
      ];
      
      setTables(mockTables);
    } catch (error) {
      console.error('Erro ao buscar tabelas:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar tabelas disponíveis',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar campos de uma tabela
  const fetchTableFields = async (table) => {
    try {
      setLoading(true);
      
      // Em um ambiente real, isso seria uma chamada à API
      // Aqui estamos simulando com dados estáticos
      let mockFields = [];
      
      switch (table.name) {
        case 'clientes':
          mockFields = [
            { name: 'id', display_name: 'ID', type: 'integer' },
            { name: 'nome', display_name: 'Nome', type: 'text' },
            { name: 'cnpj', display_name: 'CNPJ', type: 'text' },
            { name: 'email', display_name: 'Email', type: 'text' },
            { name: 'telefone', display_name: 'Telefone', type: 'text' },
            { name: 'cidade', display_name: 'Cidade', type: 'text' },
            { name: 'uf', display_name: 'UF', type: 'text' },
            { name: 'data_cadastro', display_name: 'Data de Cadastro', type: 'date' }
          ];
          break;
        case 'lancamentos':
          mockFields = [
            { name: 'id', display_name: 'ID', type: 'integer' },
            { name: 'data', display_name: 'Data', type: 'date' },
            { name: 'valor', display_name: 'Valor', type: 'numeric' },
            { name: 'tipo', display_name: 'Tipo', type: 'text' },
            { name: 'descricao', display_name: 'Descrição', type: 'text' },
            { name: 'conta_id', display_name: 'Conta ID', type: 'integer' },
            { name: 'cliente_id', display_name: 'Cliente ID', type: 'integer' }
          ];
          break;
        case 'notas_fiscais':
          mockFields = [
            { name: 'id', display_name: 'ID', type: 'integer' },
            { name: 'numero', display_name: 'Número', type: 'text' },
            { name: 'data_emissao', display_name: 'Data de Emissão', type: 'date' },
            { name: 'valor_total', display_name: 'Valor Total', type: 'numeric' },
            { name: 'cliente_id', display_name: 'Cliente ID', type: 'integer' },
            { name: 'status', display_name: 'Status', type: 'text' }
          ];
          break;
        default:
          mockFields = [
            { name: 'id', display_name: 'ID', type: 'integer' },
            { name: 'nome', display_name: 'Nome', type: 'text' },
            { name: 'descricao', display_name: 'Descrição', type: 'text' },
            { name: 'data_criacao', display_name: 'Data de Criação', type: 'date' }
          ];
      }
      
      setTableFields(mockFields);
    } catch (error) {
      console.error(`Erro ao buscar campos da tabela ${table.name}:`, error);
      setSnackbar({
        open: true,
        message: `Erro ao carregar campos da tabela ${table.display_name}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar relatórios salvos
  const fetchSavedReports = async () => {
    try {
      // Em um ambiente real, isso seria uma chamada à API
      // Aqui estamos simulando com dados estáticos
      const mockSavedReports = [
        {
          id: 1,
          name: 'Clientes por Estado',
          description: 'Relatório de clientes agrupados por estado',
          created_at: '2025-05-15T10:30:00Z',
          config: {
            tables: [{ id: 1, name: 'clientes', display_name: 'Clientes', schema: 'public' }],
            fields: [
              { table: 'clientes', field: 'uf', alias: 'Estado' },
              { table: 'clientes', field: 'count(*)', alias: 'Total de Clientes' }
            ],
            filters: [],
            groupBy: [{ table: 'clientes', field: 'uf' }],
            orderBy: [{ table: 'clientes', field: 'count(*)', direction: 'DESC' }]
          }
        },
        {
          id: 2,
          name: 'Lançamentos por Mês',
          description: 'Relatório de lançamentos agrupados por mês',
          created_at: '2025-05-10T14:45:00Z',
          config: {
            tables: [{ id: 3, name: 'lancamentos', display_name: 'Lançamentos', schema: 'public' }],
            fields: [
              { table: 'lancamentos', field: 'date_trunc(\'month\', data)', alias: 'Mês' },
              { table: 'lancamentos', field: 'sum(valor)', alias: 'Valor Total' }
            ],
            filters: [],
            groupBy: [{ table: 'lancamentos', field: 'date_trunc(\'month\', data)' }],
            orderBy: [{ table: 'lancamentos', field: 'date_trunc(\'month\', data)', direction: 'ASC' }]
          }
        }
      ];
      
      setSavedReports(mockSavedReports);
    } catch (error) {
      console.error('Erro ao buscar relatórios salvos:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar relatórios salvos',
        severity: 'error'
      });
    }
  };

  // Selecionar uma tabela
  const handleSelectTable = (table) => {
    setSelectedTable(table);
    fetchTableFields(table);
    setSelectedFields([]);
    setFilters([]);
    setGroupBy([]);
    setOrderBy([]);
  };

  // Adicionar campo ao relatório
  const handleAddField = (field) => {
    if (!selectedFields.some(f => f.name === field.name)) {
      setSelectedFields([...selectedFields, {
        ...field,
        table: selectedTable.name,
        tableDisplay: selectedTable.display_name,
        alias: field.display_name
      }]);
    }
  };

  // Remover campo do relatório
  const handleRemoveField = (index) => {
    const newFields = [...selectedFields];
    newFields.splice(index, 1);
    setSelectedFields(newFields);
  };

  // Reordenar campos do relatório
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(selectedFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSelectedFields(items);
  };

  // Adicionar filtro
  const handleAddFilter = () => {
    if (selectedFields.length === 0) {
      setSnackbar({
        open: true,
        message: 'Selecione pelo menos um campo antes de adicionar filtros',
        severity: 'warning'
      });
      return;
    }
    
    setFilters([...filters, {
      field: selectedFields[0].name,
      fieldDisplay: selectedFields[0].display_name,
      table: selectedFields[0].table,
      tableDisplay: selectedFields[0].tableDisplay,
      operator: '=',
      value: ''
    }]);
  };

  // Remover filtro
  const handleRemoveFilter = (index) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  // Atualizar filtro
  const handleUpdateFilter = (index, field, value) => {
    const newFilters = [...filters];
    newFilters[index][field] = value;
    setFilters(newFilters);
  };

  // Adicionar agrupamento
  const handleAddGroupBy = () => {
    if (selectedFields.length === 0) {
      setSnackbar({
        open: true,
        message: 'Selecione pelo menos um campo antes de adicionar agrupamentos',
        severity: 'warning'
      });
      return;
    }
    
    setGroupBy([...groupBy, {
      field: selectedFields[0].name,
      fieldDisplay: selectedFields[0].display_name,
      table: selectedFields[0].table,
      tableDisplay: selectedFields[0].tableDisplay
    }]);
  };

  // Remover agrupamento
  const handleRemoveGroupBy = (index) => {
    const newGroupBy = [...groupBy];
    newGroupBy.splice(index, 1);
    setGroupBy(newGroupBy);
  };

  // Adicionar ordenação
  const handleAddOrderBy = () => {
    if (selectedFields.length === 0) {
      setSnackbar({
        open: true,
        message: 'Selecione pelo menos um campo antes de adicionar ordenação',
        severity: 'warning'
      });
      return;
    }
    
    setOrderBy([...orderBy, {
      field: selectedFields[0].name,
      fieldDisplay: selectedFields[0].display_name,
      table: selectedFields[0].table,
      tableDisplay: selectedFields[0].tableDisplay,
      direction: 'ASC'
    }]);
  };

  // Remover ordenação
  const handleRemoveOrderBy = (index) => {
    const newOrderBy = [...orderBy];
    newOrderBy.splice(index, 1);
    setOrderBy(newOrderBy);
  };

  // Atualizar ordenação
  const handleUpdateOrderBy = (index, field, value) => {
    const newOrderBy = [...orderBy];
    newOrderBy[index][field] = value;
    setOrderBy(newOrderBy);
  };

  // Abrir diálogo para salvar relatório
  const handleOpenSaveDialog = () => {
    if (selectedFields.length === 0) {
      setSnackbar({
        open: true,
        message: 'Selecione pelo menos um campo antes de salvar o relatório',
        severity: 'warning'
      });
      return;
    }
    
    setSaveDialogOpen(true);
  };

  // Salvar relatório
  const handleSaveReport = async () => {
    try {
      if (!reportName) {
        setSnackbar({
          open: true,
          message: 'Nome do relatório é obrigatório',
          severity: 'warning'
        });
        return;
      }
      
      const reportConfig = {
        tables: [selectedTable],
        fields: selectedFields,
        filters,
        groupBy,
        orderBy
      };
      
      // Em um ambiente real, isso seria uma chamada à API
      // Aqui estamos simulando o salvamento
      console.log('Salvando relatório:', {
        name: reportName,
        description: reportDescription,
        config: reportConfig
      });
      
      // Adicionar à lista de relatórios salvos
      const newReport = {
        id: savedReports.length + 1,
        name: reportName,
        description: reportDescription,
        created_at: new Date().toISOString(),
        config: reportConfig
      };
      
      setSavedReports([...savedReports, newReport]);
      
      setSnackbar({
        open: true,
        message: 'Relatório salvo com sucesso',
        severity: 'success'
      });
      
      setSaveDialogOpen(false);
      setReportName('');
      setReportDescription('');
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar relatório',
        severity: 'error'
      });
    }
  };

  // Carregar relatório salvo
  const handleLoadReport = (report) => {
    try {
      const { config } = report;
      
      setSelectedTable(config.tables[0]);
      fetchTableFields(config.tables[0]);
      setSelectedFields(config.fields);
      setFilters(config.filters || []);
      setGroupBy(config.groupBy || []);
      setOrderBy(config.orderBy || []);
      
      setLoadReportDialogOpen(false);
      
      setSnackbar({
        open: true,
        message: `Relatório "${report.name}" carregado com sucesso`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar relatório',
        severity: 'error'
      });
    }
  };

  // Visualizar relatório
  const handlePreviewReport = async () => {
    try {
      if (selectedFields.length === 0) {
        setSnackbar({
          open: true,
          message: 'Selecione pelo menos um campo antes de visualizar o relatório',
          severity: 'warning'
        });
        return;
      }
      
      setLoading(true);
      
      // Em um ambiente real, isso seria uma chamada à API
      // Aqui estamos simulando dados de exemplo
      let mockData = [];
      
      if (selectedTable.name === 'clientes') {
        mockData = [
          { id: 1, nome: 'Empresa A', cnpj: '12.345.678/0001-90', cidade: 'São Paulo', uf: 'SP' },
          { id: 2, nome: 'Empresa B', cnpj: '98.765.432/0001-10', cidade: 'Rio de Janeiro', uf: 'RJ' },
          { id: 3, nome: 'Empresa C', cnpj: '45.678.901/0001-23', cidade: 'Belo Horizonte', uf: 'MG' },
          { id: 4, nome: 'Empresa D', cnpj: '78.901.234/0001-56', cidade: 'São Paulo', uf: 'SP' },
          { id: 5, nome: 'Empresa E', cnpj: '23.456.789/0001-89', cidade: 'Curitiba', uf: 'PR' }
        ];
      } else if (selectedTable.name === 'lancamentos') {
        mockData = [
          { id: 1, data: '2025-01-15', valor: 1500.00, tipo: 'RECEITA', descricao: 'Venda de serviços' },
          { id: 2, data: '2025-01-20', valor: 800.50, tipo: 'DESPESA', descricao: 'Aluguel' },
          { id: 3, data: '2025-02-05', valor: 2300.00, tipo: 'RECEITA', descricao: 'Venda de produtos' },
          { id: 4, data: '2025-02-10', valor: 450.75, tipo: 'DESPESA', descricao: 'Energia elétrica' },
          { id: 5, data: '2025-03-01', valor: 3200.00, tipo: 'RECEITA', descricao: 'Consultoria' }
        ];
      } else {
        mockData = [
          { id: 1, nome: 'Item 1', descricao: 'Descrição do item 1', data_criacao: '2025-01-10' },
          { id: 2, nome: 'Item 2', descricao: 'Descrição do item 2', data_criacao: '2025-01-15' },
          { id: 3, nome: 'Item 3', descricao: 'Descrição do item 3', data_criacao: '2025-02-01' },
          { id: 4, nome: 'Item 4', descricao: 'Descrição do item 4', data_criacao: '2025-02-20' },
          { id: 5, nome: 'Item 5', descricao: 'Descrição do item 5', data_criacao: '2025-03-05' }
        ];
      }
      
      // Filtrar apenas os campos selecionados
      const filteredData = mockData.map(item => {
        const newItem = {};
        selectedFields.forEach(field => {
          if (item[field.name] !== undefined) {
            newItem[field.alias || field.name] = item[field.name];
          }
        });
        return newItem;
      });
      
      setPreviewData(filteredData);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Erro ao visualizar relatório:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao visualizar relatório',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Exportar relatório
  const handleExport = (format) => {
    try {
      if (selectedFields.length === 0) {
        setSnackbar({
          open: true,
          message: 'Selecione pelo menos um campo antes de exportar o relatório',
          severity: 'warning'
        });
        return;
      }
      
      // Em um ambiente real, isso seria uma chamada à API para gerar o arquivo
      // Aqui estamos apenas simulando
      console.log(`Exportando relatório em formato ${format}`);
      
      setSnackbar({
        open: true,
        message: `Relatório exportado em formato ${format}`,
        severity: 'success'
      });
      
      setExportMenuAnchor(null);
    } catch (error) {
      console.error(`Erro ao exportar relatório em formato ${format}:`, error);
      setSnackbar({
        open: true,
        message: `Erro ao exportar relatório em formato ${format}`,
        severity: 'error'
      });
    }
  };

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gerador de Relatórios Personalizados</Typography>
        
        <Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleOpenSaveDialog}
            sx={{ mr: 1 }}
          >
            Salvar
          </Button>
          
          <Button
            variant="contained"
            startIcon={<ExportIcon />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            sx={{ mr: 1 }}
          >
            Exportar
          </Button>
          
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
          >
            <MenuItem onClick={() => handleExport('PDF')}>PDF</MenuItem>
            <MenuItem onClick={() => handleExport('Excel')}>Excel</MenuItem>
            <MenuItem onClick={() => handleExport('CSV')}>CSV</MenuItem>
          </Menu>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ViewIcon />}
            onClick={handlePreviewReport}
          >
            Visualizar
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Tabelas disponíveis */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Tabelas Disponíveis
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {tables.map((table) => (
                <ListItem
                  button
                  key={table.id}
                  selected={selectedTable && selectedTable.id === table.id}
                  onClick={() => handleSelectTable(table)}
                >
                  <ListItemText primary={table.display_name} />
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setLoadReportDialogOpen(true)}
            >
              Carregar Relatório Salvo
            </Button>
          </Paper>
        </Grid>
        
        {/* Campos da tabela */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Campos Disponíveis
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {selectedTable ? (
              <List>
                {tableFields.map((field) => (
                  <ListItem
                    button
                    key={field.name}
                    onClick={() => handleAddField(field)}
                  >
                    <ListItemText 
                      primary={field.display_name} 
                      secondary={`Tipo: ${field.type}`} 
                    />
                    <IconButton size="small" onClick={() => handleAddField(field)}>
                      <AddIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary" align="center">
                Selecione uma tabela para ver os campos disponíveis
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Campos do relatório */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Campos do Relatório
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="selected-fields">
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{ minHeight: 100 }}
                  >
                    {selectedFields.length > 0 ? (
                      selectedFields.map((field, index) => (
                        <Draggable key={`${field.table}-${field.name}`} draggableId={`${field.table}-${field.name}`} index={index}>
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                p: 1,
                                mb: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: 'background.paper'
                              }}
                            >
                              <DragIcon sx={{ mr: 1, color: 'text.secondary' }} />
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" fontWeight="bold">
                                  {field.alias || field.display_name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {field.tableDisplay}.{field.name} ({field.type})
                                </Typography>
                              </Box>
                              <IconButton size="small" onClick={() => handleRemoveField(index)}>
                                <RemoveIcon />
                              </IconButton>
                            </Box>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary" align="center">
                        Arraste campos aqui para adicionar ao relatório
                      </Typography>
                    )}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Filtros */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">
                  Filtros
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddFilter}
                >
                  Adicionar Filtro
                </Button>
              </Box>
              
              {filters.length > 0 ? (
                filters.map((filter, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {filter.tableDisplay}.{filter.fieldDisplay}
                      </Typography>
                      
                      <FormControl size="small" sx={{ minWidth: 100, mx: 1 }}>
                        <Select
                          value={filter.operator}
                          onChange={(e) => handleUpdateFilter(index, 'operator', e.target.value)}
                        >
                          <MenuItem value="=">=</MenuItem>
                          <MenuItem value="<>">≠</MenuItem>
                          <MenuItem value=">">{'>'}</MenuItem>
                          <MenuItem value="<">{'<'}</MenuItem>
                          <MenuItem value=">=">≥</MenuItem>
                          <MenuItem value="<=">≤</MenuItem>
                          <MenuItem value="LIKE">Contém</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <TextField
                        size="small"
                        value={filter.value}
                        onChange={(e) => handleUpdateFilter(index, 'value', e.target.value)}
                        sx={{ flexGrow: 1 }}
                      />
                    </Box>
                    
                    <IconButton size="small" onClick={() => handleRemoveFilter(index)}>
                      <RemoveIcon />
                    </IconButton>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" align="center">
                  Nenhum filtro adicionado
                </Typography>
              )}
            </Box>
            
            {/* Agrupamentos */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">
                  Agrupamentos
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddGroupBy}
                >
                  Adicionar Agrupamento
                </Button>
              </Box>
              
              {groupBy.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {groupBy.map((group, index) => (
                    <Chip
                      key={index}
                      label={`${group.tableDisplay}.${group.fieldDisplay}`}
                      onDelete={() => handleRemoveGroupBy(index)}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary" align="center">
                  Nenhum agrupamento adicionado
                </Typography>
              )}
            </Box>
            
            {/* Ordenação */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">
                  Ordenação
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddOrderBy}
                >
                  Adicionar Ordenação
                </Button>
              </Box>
              
              {orderBy.length > 0 ? (
                orderBy.map((order, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {order.tableDisplay}.{order.fieldDisplay}
                      </Typography>
                      
                      <FormControl size="small" sx={{ minWidth: 100, mx: 1 }}>
                        <Select
                          value={order.direction}
                          onChange={(e) => handleUpdateOrderBy(index, 'direction', e.target.value)}
                        >
                          <MenuItem value="ASC">Crescente</MenuItem>
                          <MenuItem value="DESC">Decrescente</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    
                    <IconButton size="small" onClick={() => handleRemoveOrderBy(index)}>
                      <RemoveIcon />
                    </IconButton>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" align="center">
                  Nenhuma ordenação adicionada
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Diálogo para salvar relatório */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Salvar Relatório</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Relatório"
            fullWidth
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Descrição"
            fullWidth
            multiline
            rows={3}
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveReport} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo para carregar relatório salvo */}
      <Dialog
        open={loadReportDialogOpen}
        onClose={() => setLoadReportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Carregar Relatório Salvo</DialogTitle>
        <DialogContent>
          {savedReports.length > 0 ? (
            <List>
              {savedReports.map((report) => (
                <ListItem
                  key={report.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleLoadReport(report)}>
                      <EditIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={report.name}
                    secondary={
                      <>
                        <Typography variant="body2" color="textSecondary">
                          {report.description}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Criado em: {new Date(report.created_at).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="textSecondary" align="center">
              Nenhum relatório salvo encontrado
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoadReportDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo para visualizar relatório */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Visualização do Relatório</DialogTitle>
        <DialogContent>
          {previewData && previewData.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {Object.keys(previewData[0]).map((key) => (
                      <th key={key} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex} style={{ border: '1px solid #ddd', padding: '8px' }}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary" align="center">
              Nenhum dado disponível para visualização
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Fechar</Button>
          <Button
            variant="contained"
            onClick={() => setExportMenuAnchor(document.getElementById('preview-export-button'))}
            id="preview-export-button"
          >
            Exportar
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
      
      {/* Indicador de carregamento */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default GeradorRelatorios;
