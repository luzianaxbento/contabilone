import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  AccountBalance as ContabilIcon,
  Receipt as FiscalIcon,
  People as FolhaIcon,
  Apartment as PatrimonioIcon,
  Group as SocietarioIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Largura da barra lateral
const drawerWidth = 240;

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Itens do menu
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Cadastro de Empresas', icon: <BusinessIcon />, path: '/cadastro/empresas' },
    { text: 'Contábil', icon: <ContabilIcon />, path: '/contabil' },
    { text: 'Fiscal', icon: <FiscalIcon />, path: '/fiscal' },
    { text: 'Folha', icon: <FolhaIcon />, path: '/folha' },
    { text: 'Patrimônio', icon: <PatrimonioIcon />, path: '/patrimonio' },
    { text: 'Societário', icon: <SocietarioIcon />, path: '/societario' },
  ];

  // Conteúdo da barra lateral
  const drawer = (
    <Box sx={{ bgcolor: '#1e2a38', color: 'white', height: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Sistema Contábil
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            to={item.path}
            selected={location.pathname === item.path}
            onClick={isMobile ? handleDrawerToggle : undefined}
            sx={{
              '&.Mui-selected': {
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.15)',
                },
              },
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.05)',
              },
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              color: 'white',
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mt: 2 }} />
      <List>
        <ListItem 
          button 
          onClick={logout}
          sx={{
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.05)',
            },
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            color: 'white',
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          width: { sm: `calc(100% - ${drawerWidth}px)` }, 
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit">
            <SettingsIcon />
          </IconButton>
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar 
              alt={user?.nome || 'Usuário'} 
              src="/static/images/avatar/1.jpg" 
              sx={{ bgcolor: 'primary.main' }}
            />
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Barra lateral */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Versão móvel */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Melhor desempenho em dispositivos móveis
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: '#1e2a38',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Versão desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: '#1e2a38',
              border: 'none'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 0,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#f5f5f7',
          minHeight: '100vh'
        }}
      >
        <Toolbar /> {/* Espaçamento para a AppBar */}
        <Outlet /> {/* Renderiza as rotas filhas */}
      </Box>
    </Box>
  );
};

export default MainLayout;
