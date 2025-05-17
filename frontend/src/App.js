import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';

// Definição do tema principal
const theme = createTheme({
  palette: {
    primary: {
      main: '#1E88E5', // Azul (Módulo Contábil)
      light: '#64B5F6',
      dark: '#0D47A1',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#43A047', // Verde (Módulo Fiscal)
      light: '#76D275',
      dark: '#2E7D32',
      contrastText: '#FFFFFF',
    },
    folha: {
      main: '#8E24AA', // Roxo (Módulo Folha)
      light: '#BA68C8',
      dark: '#6A1B9A',
      contrastText: '#FFFFFF',
    },
    patrimonio: {
      main: '#FB8C00', // Laranja (Módulo Patrimônio)
      light: '#FFB74D',
      dark: '#EF6C00',
      contrastText: '#FFFFFF',
    },
    societario: {
      main: '#E53935', // Vermelho (Módulo Societário)
      light: '#EF5350',
      dark: '#C62828',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
