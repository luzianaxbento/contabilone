import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Avatar, Container, Alert } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Esquema de validação com Formik e Yup
  const formik = useFormik({
    initialValues: {
      email: '',
      senha: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Email inválido')
        .required('Email é obrigatório'),
      senha: Yup.string()
        .min(6, 'A senha deve ter pelo menos 6 caracteres')
        .required('Senha é obrigatória')
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await login(values.email, values.senha);
        
        if (!result.success) {
          setError(result.message);
        }
      } catch (err) {
        setError('Erro ao realizar login. Tente novamente.');
        console.error('Erro no login:', err);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlined />
        </Avatar>
        
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Sistema Contábil Completo
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            disabled={loading}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="senha"
            label="Senha"
            type="password"
            id="senha"
            autoComplete="current-password"
            value={formik.values.senha}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.senha && Boolean(formik.errors.senha)}
            helperText={formik.touched.senha && formik.errors.senha}
            disabled={loading}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link to="/recuperar-senha" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                Esqueceu sua senha?
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Sistema Contábil Completo
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
