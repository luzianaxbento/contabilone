// Configuração do backend para uso com Supabase
// Este arquivo substitui a configuração tradicional de banco de dados

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurações do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://fbnzmzjkvtrxclfgvsnd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibnptemprdnRyeGNsZmd2c25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NDAxMTAsImV4cCI6MjA2MzAxNjExMH0.ttgNMWg7moPE4nuGIMlVn6d_ZnjYV-PpQNghQBkgmew';

// Criar cliente Supabase com chave de serviço para acesso administrativo
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Exportar cliente Supabase para uso em todo o backend
module.exports = supabase;
