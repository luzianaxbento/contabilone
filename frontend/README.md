# Frontend do Sistema Contábil

Este diretório contém o código-fonte do frontend do Sistema Contábil Completo, desenvolvido em React com Material-UI.

## Estrutura de Diretórios

```
frontend/
├── public/           # Arquivos públicos
├── src/              # Código-fonte
│   ├── assets/       # Imagens, ícones e outros recursos
│   ├── components/   # Componentes reutilizáveis
│   ├── contexts/     # Contextos React
│   ├── hooks/        # Hooks personalizados
│   ├── layouts/      # Layouts da aplicação
│   ├── pages/        # Páginas da aplicação
│   ├── services/     # Serviços de API
│   ├── styles/       # Estilos globais
│   ├── utils/        # Utilitários e funções auxiliares
│   ├── App.js        # Componente principal
│   ├── index.js      # Ponto de entrada
│   └── routes.js     # Configuração de rotas
└── package.json      # Dependências do projeto
```

## Requisitos

- Node.js 18+
- npm ou yarn

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente criando um arquivo `.env` na raiz do projeto:
```
REACT_APP_API_URL=http://localhost:3000/api/v1
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

## Módulos Principais

- **Autenticação**: Login, recuperação de senha, gerenciamento de perfil
- **Contábil**: Plano de contas, lançamentos contábeis, relatórios
- **Fiscal**: Documentos fiscais, apuração de impostos, obrigações acessórias
- **Folha**: Funcionários, folha de pagamento, férias, 13º salário
- **Patrimônio**: Ativos, depreciação, inventário
- **Societário**: Sócios, capital social, distribuição de lucros

## Temas e Personalização

O sistema suporta temas claros e escuros, além de personalização de cores por módulo:

- **Módulo Contábil**: Azul
- **Módulo Fiscal**: Verde
- **Módulo Folha**: Roxo
- **Módulo Patrimônio**: Laranja
- **Módulo Societário**: Vermelho

## Responsividade

O frontend é totalmente responsivo, adaptando-se a diferentes tamanhos de tela:

- Desktop
- Tablet
- Mobile

## Acessibilidade

O sistema segue as diretrizes de acessibilidade WCAG 2.1, garantindo:

- Contraste adequado
- Navegação por teclado
- Suporte a leitores de tela
- Textos alternativos para imagens
