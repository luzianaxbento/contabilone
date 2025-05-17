# Backend do Sistema Contábil

Este diretório contém o código-fonte do backend do Sistema Contábil Completo, desenvolvido em Node.js com Express e PostgreSQL.

## Estrutura de Diretórios

```
backend/
├── config/           # Configurações do sistema
├── controllers/      # Controladores da API
├── middlewares/      # Middlewares personalizados
├── models/           # Modelos de dados
├── routes/           # Rotas da API
├── services/         # Serviços de negócio
├── utils/            # Utilitários e funções auxiliares
├── app.js            # Aplicação principal
├── server.js         # Servidor HTTP
└── package.json      # Dependências do projeto
```

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente criando um arquivo `.env` na raiz do projeto:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_contabil
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=seu_segredo_jwt
PORT=3000
```

3. Inicie o servidor:
```bash
npm start
```

## Documentação da API

A API segue o padrão RESTful e está disponível em `/api/v1`.

### Autenticação

A API utiliza autenticação JWT (JSON Web Token). Para obter um token, faça uma requisição POST para `/api/v1/auth/login` com as credenciais de usuário.

### Endpoints Principais

- `/api/v1/auth`: Autenticação e gerenciamento de usuários
- `/api/v1/contabil`: Módulo contábil
- `/api/v1/fiscal`: Módulo fiscal
- `/api/v1/folha`: Módulo de folha de pagamento
- `/api/v1/patrimonio`: Módulo de patrimônio
- `/api/v1/societario`: Módulo societário

Consulte a documentação completa da API para mais detalhes sobre os endpoints disponíveis.
