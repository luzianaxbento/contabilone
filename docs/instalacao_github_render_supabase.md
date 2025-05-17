# Sistema Contábil Completo - Guia de Instalação e Uso

Este guia detalha como configurar e implantar o Sistema Contábil Completo utilizando GitHub Web, Render e Supabase.

## Pré-requisitos

- Conta no [GitHub](https://github.com/)
- Conta no [Render](https://render.com/)
- Conta no [Supabase](https://supabase.com/)

## 1. Configuração do Supabase

### 1.1. Criar um novo projeto no Supabase

1. Acesse [Supabase](https://supabase.com/) e faça login
2. Clique em "New Project"
3. Preencha os detalhes do projeto:
   - Nome: `sistema-contabil` (ou outro nome de sua preferência)
   - Senha do banco de dados: crie uma senha forte
   - Região: escolha a mais próxima de você
4. Clique em "Create new project"

### 1.2. Configurar o banco de dados

1. Após a criação do projeto, vá para a seção "SQL Editor"
2. Clique em "New Query"
3. Cole o conteúdo do arquivo `database/supabase_schema.sql`
4. Clique em "Run" para executar o script SQL

### 1.3. Obter as credenciais do Supabase

1. No painel do Supabase, vá para "Settings" > "API"
2. Anote as seguintes informações:
   - URL do projeto: `https://fbnzmzjkvtrxclfgvsnd.supabase.co`
   - Chave anônima: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibnptemprdnRyeGNsZmd2c25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NDAxMTAsImV4cCI6MjA2MzAxNjExMH0.ttgNMWg7moPE4nuGIMlVn6d_ZnjYV-PpQNghQBkgmew`
   - Chave de serviço: (mantenha esta chave segura, ela não deve ser compartilhada)

## 2. Configuração do GitHub Web

### 2.1. Criar um repositório no GitHub

1. Acesse [GitHub](https://github.com/) e faça login
2. Clique em "+" no canto superior direito e selecione "New repository"
3. Preencha os detalhes do repositório:
   - Nome: `contabilone` (conforme seu repositório existente)
   - Descrição: `Sistema Contábil Completo`
   - Visibilidade: Público ou Privado (sua escolha)
4. Clique em "Create repository"

### 2.2. Fazer upload dos arquivos via GitHub Web

1. Acesse seu repositório `https://github.com/luzianaxbento/contabilone`
2. Clique em "Add file" > "Upload files"
3. Arraste os arquivos do sistema ou clique para selecionar
4. Organize os arquivos mantendo a estrutura de diretórios:
   - `/backend`
   - `/frontend`
   - `/database`
   - `/docs`
5. Adicione uma mensagem de commit: "Versão inicial do Sistema Contábil"
6. Clique em "Commit changes"

**Nota**: Como o GitHub Web tem limitações para upload de muitos arquivos de uma vez, você pode precisar fazer vários commits, organizando por pastas.

## 3. Implantação do Backend no Render

### 3.1. Criar um novo Web Service no Render

1. Acesse [Render](https://render.com/) e faça login
2. Clique em "New" > "Web Service"
3. Conecte seu repositório GitHub
4. Configure o serviço:
   - Nome: `sistema-contabil-api`
   - Ambiente: `Node`
   - Diretório raiz: `backend`
   - Comando de build: `npm install`
   - Comando de início: `node server.js`
   - Plano: Selecione o plano gratuito ou pago conforme sua necessidade

### 3.2. Configurar variáveis de ambiente no Render

1. Na seção "Environment", adicione as seguintes variáveis:
   - `SUPABASE_URL`: `https://fbnzmzjkvtrxclfgvsnd.supabase.co`
   - `SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibnptemprdnRyeGNsZmd2c25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NDAxMTAsImV4cCI6MjA2MzAxNjExMH0.ttgNMWg7moPE4nuGIMlVn6d_ZnjYV-PpQNghQBkgmew`
   - `SUPABASE_SERVICE_KEY`: (sua chave de serviço do Supabase)
   - `PORT`: `10000`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (gere uma string aleatória segura)
   - `JWT_EXPIRES_IN`: `24h`

2. Clique em "Save Changes" e depois em "Create Web Service"

### 3.3. Verificar a implantação do backend

1. Aguarde a conclusão da implantação
2. Acesse a URL fornecida pelo Render (ex: `https://sistema-contabil-api.onrender.com`)
3. Verifique se a API está funcionando acessando `https://sistema-contabil-api.onrender.com/api/status`

## 4. Implantação do Frontend no Render

### 4.1. Criar um novo Static Site no Render

1. No painel do Render, clique em "New" > "Static Site"
2. Conecte seu repositório GitHub
3. Configure o site:
   - Nome: `sistema-contabil`
   - Diretório raiz: `frontend`
   - Comando de build: `npm install && npm run build`
   - Diretório de publicação: `build`
   - Plano: Selecione o plano gratuito ou pago conforme sua necessidade

### 4.2. Configurar variáveis de ambiente no Render

1. Na seção "Environment", adicione as seguintes variáveis:
   - `REACT_APP_SUPABASE_URL`: `https://fbnzmzjkvtrxclfgvsnd.supabase.co`
   - `REACT_APP_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibnptemprdnRyeGNsZmd2c25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NDAxMTAsImV4cCI6MjA2MzAxNjExMH0.ttgNMWg7moPE4nuGIMlVn6d_ZnjYV-PpQNghQBkgmew`
   - `REACT_APP_API_URL`: (URL do seu backend, ex: `https://sistema-contabil-api.onrender.com/api`)

2. Clique em "Save Changes" e depois em "Create Static Site"

### 4.3. Verificar a implantação do frontend

1. Aguarde a conclusão da implantação
2. Acesse a URL fornecida pelo Render (ex: `https://sistema-contabil.onrender.com`)
3. Verifique se o site está funcionando corretamente

## 5. Uso do Sistema

### 5.1. Primeiro acesso

1. Acesse o frontend através da URL fornecida pelo Render
2. Faça login com as credenciais padrão:
   - Email: `admin@sistema.com`
   - Senha: `admin123`
3. Altere a senha padrão imediatamente após o primeiro login

### 5.2. Configurações iniciais

1. Acesse o menu "Configurações"
2. Atualize as informações da empresa:
   - Nome da empresa
   - CNPJ
   - Endereço
   - Regime tributário
3. Configure os usuários do sistema conforme necessário

### 5.3. Módulos do sistema

O sistema contém os seguintes módulos integrados:

#### Módulo Contábil
- Plano de contas
- Lançamentos contábeis
- Relatórios contábeis
- Integração com ECD

#### Módulo Fiscal
- Documentos fiscais
- Apuração de impostos
- Obrigações acessórias (EFD ICMS/IPI, EFD Contribuições, ECF, MIT)
- Integração com SPED

#### Módulo Folha de Pagamento
- Cadastro de funcionários
- Folha de pagamento
- Férias e 13º salário
- Obrigações acessórias (FGTS Digital, eSocial, EFD-Reinf, DCTFWeb)

#### Módulo Patrimônio
- Cadastro de ativos
- Depreciação
- Inventário
- Controle de localização

#### Módulo Societário
- Cadastro de sócios
- Capital social
- Distribuição de lucros
- Assembleias

## 6. Manutenção e Atualizações

### 6.1. Atualização do código

1. Faça as alterações necessárias no código localmente
2. Faça upload das alterações para o GitHub Web:
   - Acesse seu repositório
   - Navegue até o arquivo que deseja alterar
   - Clique no ícone de edição (lápis)
   - Faça as alterações
   - Adicione uma mensagem de commit
   - Clique em "Commit changes"

3. O Render detectará automaticamente as alterações e iniciará uma nova implantação

### 6.2. Backup do banco de dados

1. No painel do Supabase, vá para "Database" > "Backups"
2. Clique em "Create Backup" para criar um backup manual
3. Os backups automáticos são realizados diariamente pelo Supabase

## 7. Solução de Problemas

### 7.1. Problemas de conexão com o Supabase

1. Verifique se as credenciais do Supabase estão corretas nas variáveis de ambiente
2. Verifique se as políticas de segurança (RLS) estão configuradas corretamente
3. Consulte os logs do Supabase para identificar possíveis erros

### 7.2. Problemas de implantação no Render

1. Verifique os logs de build e deploy no painel do Render
2. Certifique-se de que todas as variáveis de ambiente estão configuradas corretamente
3. Verifique se os comandos de build e start estão corretos

### 7.3. Problemas no frontend

1. Abra o console do navegador para verificar erros
2. Verifique se a URL da API está configurada corretamente
3. Certifique-se de que o CORS está configurado corretamente no backend

## 8. Suporte

Para suporte técnico, entre em contato através do email: suporte@sistemacontabil.com.br
