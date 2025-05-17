-- Script SQL para criação das tabelas do Sistema Contábil no Supabase
-- Este script cria todas as tabelas, relacionamentos e tipos necessários para o sistema

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Criar schema para organização
CREATE SCHEMA IF NOT EXISTS sistema_contabil;

-- Definir o schema padrão
SET search_path TO sistema_contabil, public;

-- Tipos enumerados (ENUM)
CREATE TYPE tipo_conta AS ENUM ('ATIVO', 'PASSIVO', 'RECEITA', 'DESPESA', 'RESULTADO');
CREATE TYPE natureza_conta AS ENUM ('DEVEDORA', 'CREDORA');
CREATE TYPE tipo_lancamento AS ENUM ('NORMAL', 'ABERTURA', 'ENCERRAMENTO', 'AJUSTE', 'RECLASSIFICACAO');
CREATE TYPE status_lancamento AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO', 'ESTORNADO');
CREATE TYPE tipo_partida AS ENUM ('DEBITO', 'CREDITO');
CREATE TYPE tipo_documento_fiscal AS ENUM ('NFE', 'NFCE', 'CTE', 'NFSE', 'NFTS');
CREATE TYPE status_documento AS ENUM ('EMITIDA', 'CANCELADA', 'INUTILIZADA', 'DENEGADA');
CREATE TYPE tipo_pessoa AS ENUM ('PESSOA_FISICA', 'PESSOA_JURIDICA');
CREATE TYPE status_registro AS ENUM ('ATIVO', 'INATIVO');
CREATE TYPE perfil_usuario AS ENUM ('ADMIN', 'CONTADOR', 'AUXILIAR', 'GERENTE', 'CONSULTA');
CREATE TYPE status_folha AS ENUM ('EM_PROCESSAMENTO', 'FINALIZADA', 'CANCELADA');

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    perfil perfil_usuario NOT NULL DEFAULT 'CONSULTA',
    cargo VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE,
    ultimo_acesso TIMESTAMP,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Centros de Custo
CREATE TABLE IF NOT EXISTS centros_custo (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    descricao VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Plano de Contas
CREATE TABLE IF NOT EXISTS plano_contas (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    descricao VARCHAR(255) NOT NULL,
    tipo tipo_conta NOT NULL,
    natureza natureza_conta NOT NULL,
    nivel INTEGER NOT NULL,
    conta_pai_id INTEGER REFERENCES plano_contas(id),
    permite_lancamento BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Lançamentos Contábeis
CREATE TABLE IF NOT EXISTS lancamentos_contabeis (
    id SERIAL PRIMARY KEY,
    numero_lancamento VARCHAR(50) NOT NULL UNIQUE,
    data_lancamento DATE NOT NULL,
    data_competencia DATE NOT NULL,
    tipo_lancamento tipo_lancamento NOT NULL,
    historico TEXT NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    usuario_id UUID REFERENCES usuarios(id),
    origem VARCHAR(50),
    origem_id INTEGER,
    status status_lancamento NOT NULL DEFAULT 'PENDENTE',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Partidas de Lançamento
CREATE TABLE IF NOT EXISTS partidas_lancamento (
    id SERIAL PRIMARY KEY,
    lancamento_id INTEGER NOT NULL REFERENCES lancamentos_contabeis(id) ON DELETE CASCADE,
    conta_id INTEGER NOT NULL REFERENCES plano_contas(id),
    centro_custo_id INTEGER REFERENCES centros_custo(id),
    tipo tipo_partida NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    historico_complementar TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Documentos Fiscais
CREATE TABLE IF NOT EXISTS documentos_fiscais (
    id SERIAL PRIMARY KEY,
    tipo_documento tipo_documento_fiscal NOT NULL,
    numero VARCHAR(20) NOT NULL,
    serie VARCHAR(5) NOT NULL,
    chave_acesso VARCHAR(44),
    data_emissao DATE NOT NULL,
    data_entrada DATE,
    valor_total DECIMAL(15, 2) NOT NULL,
    valor_produtos DECIMAL(15, 2) NOT NULL,
    valor_servicos DECIMAL(15, 2) DEFAULT 0,
    valor_frete DECIMAL(15, 2) DEFAULT 0,
    valor_seguro DECIMAL(15, 2) DEFAULT 0,
    valor_desconto DECIMAL(15, 2) DEFAULT 0,
    valor_outras_despesas DECIMAL(15, 2) DEFAULT 0,
    valor_icms DECIMAL(15, 2) DEFAULT 0,
    valor_ipi DECIMAL(15, 2) DEFAULT 0,
    valor_pis DECIMAL(15, 2) DEFAULT 0,
    valor_cofins DECIMAL(15, 2) DEFAULT 0,
    valor_csll DECIMAL(15, 2) DEFAULT 0,
    valor_irpj DECIMAL(15, 2) DEFAULT 0,
    valor_iss DECIMAL(15, 2) DEFAULT 0,
    cnpj_emitente VARCHAR(18) NOT NULL,
    nome_emitente VARCHAR(255) NOT NULL,
    cnpj_destinatario VARCHAR(18) NOT NULL,
    nome_destinatario VARCHAR(255) NOT NULL,
    status status_documento NOT NULL DEFAULT 'EMITIDA',
    xml_path VARCHAR(255),
    pdf_path VARCHAR(255),
    lancamento_id INTEGER REFERENCES lancamentos_contabeis(id),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tipo_documento, numero, serie, cnpj_emitente)
);

-- Tabela de Itens de Documentos Fiscais
CREATE TABLE IF NOT EXISTS itens_documento_fiscal (
    id SERIAL PRIMARY KEY,
    documento_id INTEGER NOT NULL REFERENCES documentos_fiscais(id) ON DELETE CASCADE,
    numero_item INTEGER NOT NULL,
    codigo_produto VARCHAR(60) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    ncm VARCHAR(8),
    cfop VARCHAR(4) NOT NULL,
    unidade VARCHAR(6) NOT NULL,
    quantidade DECIMAL(15, 4) NOT NULL,
    valor_unitario DECIMAL(15, 4) NOT NULL,
    valor_total DECIMAL(15, 2) NOT NULL,
    valor_desconto DECIMAL(15, 2) DEFAULT 0,
    valor_icms DECIMAL(15, 2) DEFAULT 0,
    valor_ipi DECIMAL(15, 2) DEFAULT 0,
    valor_pis DECIMAL(15, 2) DEFAULT 0,
    valor_cofins DECIMAL(15, 2) DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(documento_id, numero_item)
);

-- Tabela de Funcionários
CREATE TABLE IF NOT EXISTS funcionarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    rg VARCHAR(20),
    data_nascimento DATE NOT NULL,
    sexo CHAR(1) NOT NULL,
    estado_civil VARCHAR(20),
    endereco VARCHAR(255) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    telefone VARCHAR(15),
    email VARCHAR(255),
    cargo VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    data_admissao DATE NOT NULL,
    data_demissao DATE,
    salario DECIMAL(15, 2) NOT NULL,
    tipo_contrato VARCHAR(50) NOT NULL,
    pis VARCHAR(14) NOT NULL,
    ctps VARCHAR(20) NOT NULL,
    serie_ctps VARCHAR(10) NOT NULL,
    banco VARCHAR(100),
    agencia VARCHAR(10),
    conta VARCHAR(20),
    status status_registro NOT NULL DEFAULT 'ATIVO',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Folhas de Pagamento
CREATE TABLE IF NOT EXISTS folhas_pagamento (
    id SERIAL PRIMARY KEY,
    competencia VARCHAR(7) NOT NULL, -- Formato: YYYY-MM
    data_calculo DATE NOT NULL,
    status status_folha NOT NULL DEFAULT 'EM_PROCESSAMENTO',
    valor_total DECIMAL(15, 2) NOT NULL DEFAULT 0,
    data_pagamento DATE,
    observacoes TEXT,
    lancamento_id INTEGER REFERENCES lancamentos_contabeis(id),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(competencia)
);

-- Tabela de Cálculos de Folha
CREATE TABLE IF NOT EXISTS calculos_folha (
    id SERIAL PRIMARY KEY,
    folha_id INTEGER NOT NULL REFERENCES folhas_pagamento(id) ON DELETE CASCADE,
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id),
    salario_base DECIMAL(15, 2) NOT NULL,
    horas_trabalhadas DECIMAL(10, 2),
    horas_extras DECIMAL(10, 2) DEFAULT 0,
    faltas DECIMAL(10, 2) DEFAULT 0,
    total_proventos DECIMAL(15, 2) NOT NULL,
    total_descontos DECIMAL(15, 2) NOT NULL,
    valor_liquido DECIMAL(15, 2) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(folha_id, funcionario_id)
);

-- Tabela de Itens de Cálculo de Folha
CREATE TABLE IF NOT EXISTS itens_calculo_folha (
    id SERIAL PRIMARY KEY,
    calculo_id INTEGER NOT NULL REFERENCES calculos_folha(id) ON DELETE CASCADE,
    codigo VARCHAR(10) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    tipo CHAR(1) NOT NULL, -- P: Provento, D: Desconto
    referencia VARCHAR(20),
    valor DECIMAL(15, 2) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Ativos
CREATE TABLE IF NOT EXISTS ativos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descricao VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    data_aquisicao DATE NOT NULL,
    valor_aquisicao DECIMAL(15, 2) NOT NULL,
    valor_atual DECIMAL(15, 2) NOT NULL,
    vida_util INTEGER NOT NULL, -- Em meses
    taxa_depreciacao DECIMAL(5, 2) NOT NULL, -- Percentual anual
    depreciavel BOOLEAN DEFAULT TRUE,
    localizacao VARCHAR(100) NOT NULL,
    responsavel VARCHAR(100),
    numero_serie VARCHAR(50),
    numero_nota_fiscal VARCHAR(20),
    fornecedor VARCHAR(255),
    observacoes TEXT,
    status status_registro NOT NULL DEFAULT 'ATIVO',
    data_baixa DATE,
    motivo_baixa VARCHAR(255),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Depreciações
CREATE TABLE IF NOT EXISTS depreciacoes (
    id SERIAL PRIMARY KEY,
    competencia VARCHAR(7) NOT NULL, -- Formato: YYYY-MM
    data_calculo DATE NOT NULL,
    valor_total DECIMAL(15, 2) NOT NULL,
    lancamento_id INTEGER REFERENCES lancamentos_contabeis(id),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(competencia)
);

-- Tabela de Itens de Depreciação
CREATE TABLE IF NOT EXISTS itens_depreciacao (
    id SERIAL PRIMARY KEY,
    depreciacao_id INTEGER NOT NULL REFERENCES depreciacoes(id) ON DELETE CASCADE,
    ativo_id INTEGER NOT NULL REFERENCES ativos(id),
    valor_depreciacao DECIMAL(15, 2) NOT NULL,
    valor_acumulado DECIMAL(15, 2) NOT NULL,
    valor_residual DECIMAL(15, 2) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(depreciacao_id, ativo_id)
);

-- Tabela de Sócios
CREATE TABLE IF NOT EXISTS socios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(18) NOT NULL UNIQUE,
    tipo tipo_pessoa NOT NULL,
    participacao DECIMAL(5, 2) NOT NULL, -- Percentual
    valor_capital DECIMAL(15, 2) NOT NULL,
    data_entrada DATE NOT NULL,
    data_saida DATE,
    endereco VARCHAR(255),
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf CHAR(2),
    cep VARCHAR(9),
    telefone VARCHAR(15),
    email VARCHAR(255),
    status status_registro NOT NULL DEFAULT 'ATIVO',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Distribuições de Lucro
CREATE TABLE IF NOT EXISTS distribuicoes_lucro (
    id SERIAL PRIMARY KEY,
    data DATE NOT NULL,
    valor_total DECIMAL(15, 2) NOT NULL,
    observacoes TEXT,
    lancamento_id INTEGER REFERENCES lancamentos_contabeis(id),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itens de Distribuição de Lucro
CREATE TABLE IF NOT EXISTS itens_distribuicao (
    id SERIAL PRIMARY KEY,
    distribuicao_id INTEGER NOT NULL REFERENCES distribuicoes_lucro(id) ON DELETE CASCADE,
    socio_id INTEGER NOT NULL REFERENCES socios(id),
    valor DECIMAL(15, 2) NOT NULL,
    data_pagamento DATE,
    forma_pagamento VARCHAR(50),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(distribuicao_id, socio_id)
);

-- Tabela de Configurações do Sistema
CREATE TABLE IF NOT EXISTS configuracoes (
    id SERIAL PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descricao VARCHAR(255),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Logs do Sistema
CREATE TABLE IF NOT EXISTS logs_sistema (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id),
    acao VARCHAR(50) NOT NULL,
    tabela VARCHAR(50) NOT NULL,
    registro_id INTEGER,
    dados JSONB,
    ip VARCHAR(45),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos_contabeis(data_lancamento);
CREATE INDEX IF NOT EXISTS idx_lancamentos_competencia ON lancamentos_contabeis(data_competencia);
CREATE INDEX IF NOT EXISTS idx_lancamentos_status ON lancamentos_contabeis(status);
CREATE INDEX IF NOT EXISTS idx_partidas_lancamento ON partidas_lancamento(lancamento_id);
CREATE INDEX IF NOT EXISTS idx_partidas_conta ON partidas_lancamento(conta_id);
CREATE INDEX IF NOT EXISTS idx_documentos_data ON documentos_fiscais(data_emissao);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos_fiscais(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_documentos_status ON documentos_fiscais(status);
CREATE INDEX IF NOT EXISTS idx_funcionarios_status ON funcionarios(status);
CREATE INDEX IF NOT EXISTS idx_ativos_status ON ativos(status);
CREATE INDEX IF NOT EXISTS idx_socios_status ON socios(status);
CREATE INDEX IF NOT EXISTS idx_folhas_competencia ON folhas_pagamento(competencia);
CREATE INDEX IF NOT EXISTS idx_depreciacoes_competencia ON depreciacoes(competencia);

-- Funções e Triggers para atualização automática de data_atualizacao
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.data_atualizacao = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'sistema_contabil' 
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_timestamp
            BEFORE UPDATE ON sistema_contabil.%I
            FOR EACH ROW
            EXECUTE FUNCTION update_timestamp()', t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Inserir dados iniciais

-- Usuário administrador padrão
INSERT INTO usuarios (nome, email, perfil, cargo, ativo)
VALUES ('Administrador', 'admin@sistema.com', 'ADMIN', 'Administrador do Sistema', true)
ON CONFLICT (email) DO NOTHING;

-- Configurações iniciais do sistema
INSERT INTO configuracoes (chave, valor, descricao)
VALUES 
('NOME_EMPRESA', 'Minha Empresa', 'Nome da empresa'),
('CNPJ_EMPRESA', '00.000.000/0001-00', 'CNPJ da empresa'),
('ENDERECO_EMPRESA', 'Rua Exemplo, 123', 'Endereço da empresa'),
('CIDADE_EMPRESA', 'São Paulo', 'Cidade da empresa'),
('UF_EMPRESA', 'SP', 'UF da empresa'),
('CEP_EMPRESA', '00000-000', 'CEP da empresa'),
('TELEFONE_EMPRESA', '(11) 1234-5678', 'Telefone da empresa'),
('EMAIL_EMPRESA', 'contato@minhaempresa.com', 'Email da empresa'),
('REGIME_TRIBUTARIO', 'SIMPLES', 'Regime tributário da empresa'),
('VERSAO_SISTEMA', '1.0.0', 'Versão atual do sistema')
ON CONFLICT (chave) DO NOTHING;

-- Plano de contas básico
INSERT INTO plano_contas (codigo, descricao, tipo, natureza, nivel, permite_lancamento)
VALUES 
('1', 'ATIVO', 'ATIVO', 'DEVEDORA', 1, false),
('1.1', 'ATIVO CIRCULANTE', 'ATIVO', 'DEVEDORA', 2, false),
('1.1.1', 'DISPONÍVEL', 'ATIVO', 'DEVEDORA', 3, false),
('1.1.1.01', 'CAIXA', 'ATIVO', 'DEVEDORA', 4, true),
('1.1.1.02', 'BANCOS CONTA MOVIMENTO', 'ATIVO', 'DEVEDORA', 4, true),
('1.1.2', 'CRÉDITOS', 'ATIVO', 'DEVEDORA', 3, false),
('1.1.2.01', 'CLIENTES', 'ATIVO', 'DEVEDORA', 4, true),
('1.2', 'ATIVO NÃO CIRCULANTE', 'ATIVO', 'DEVEDORA', 2, false),
('1.2.1', 'REALIZÁVEL A LONGO PRAZO', 'ATIVO', 'DEVEDORA', 3, false),
('1.2.2', 'INVESTIMENTOS', 'ATIVO', 'DEVEDORA', 3, false),
('1.2.3', 'IMOBILIZADO', 'ATIVO', 'DEVEDORA', 3, false),
('1.2.3.01', 'BENS EM OPERAÇÃO', 'ATIVO', 'DEVEDORA', 4, true),
('1.2.3.02', 'DEPRECIAÇÃO ACUMULADA', 'ATIVO', 'CREDORA', 4, true),
('2', 'PASSIVO', 'PASSIVO', 'CREDORA', 1, false),
('2.1', 'PASSIVO CIRCULANTE', 'PASSIVO', 'CREDORA', 2, false),
('2.1.1', 'FORNECEDORES', 'PASSIVO', 'CREDORA', 3, true),
('2.1.2', 'OBRIGAÇÕES TRIBUTÁRIAS', 'PASSIVO', 'CREDORA', 3, true),
('2.1.3', 'OBRIGAÇÕES TRABALHISTAS E PREVIDENCIÁRIAS', 'PASSIVO', 'CREDORA', 3, true),
('2.2', 'PASSIVO NÃO CIRCULANTE', 'PASSIVO', 'CREDORA', 2, false),
('2.3', 'PATRIMÔNIO LÍQUIDO', 'PASSIVO', 'CREDORA', 2, false),
('2.3.1', 'CAPITAL SOCIAL', 'PASSIVO', 'CREDORA', 3, true),
('2.3.2', 'RESERVAS', 'PASSIVO', 'CREDORA', 3, true),
('2.3.3', 'LUCROS OU PREJUÍZOS ACUMULADOS', 'PASSIVO', 'CREDORA', 3, true),
('3', 'RECEITAS', 'RECEITA', 'CREDORA', 1, false),
('3.1', 'RECEITAS OPERACIONAIS', 'RECEITA', 'CREDORA', 2, false),
('3.1.1', 'RECEITA BRUTA DE VENDAS', 'RECEITA', 'CREDORA', 3, true),
('3.1.2', 'DEDUÇÕES DA RECEITA BRUTA', 'RECEITA', 'DEVEDORA', 3, true),
('4', 'DESPESAS', 'DESPESA', 'DEVEDORA', 1, false),
('4.1', 'DESPESAS OPERACIONAIS', 'DESPESA', 'DEVEDORA', 2, false),
('4.1.1', 'DESPESAS ADMINISTRATIVAS', 'DESPESA', 'DEVEDORA', 3, true),
('4.1.2', 'DESPESAS COM PESSOAL', 'DESPESA', 'DEVEDORA', 3, true),
('4.1.3', 'DESPESAS TRIBUTÁRIAS', 'DESPESA', 'DEVEDORA', 3, true),
('5', 'RESULTADO', 'RESULTADO', 'DEVEDORA', 1, false),
('5.1', 'RESULTADO DO EXERCÍCIO', 'RESULTADO', 'DEVEDORA', 2, true)
ON CONFLICT (codigo) DO NOTHING;

-- Atualizar referências de conta_pai_id
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '1') WHERE codigo LIKE '1.%' AND conta_pai_id IS NULL;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '1.1') WHERE codigo LIKE '1.1.%' AND conta_pai_id IS NULL;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '1.1.1') WHERE codigo LIKE '1.1.1.%' AND conta_pai_id IS NULL;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '1.1.2') WHERE codigo LIKE '1.1.2.%' AND conta_pai_id IS NULL;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '1.2') WHERE codigo LIKE '1.2.%' AND conta_pai_id IS NULL;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '1.2.3') WHERE codigo LIKE '1.2.3.%' AND conta_pai_id IS NULL;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '2') WHERE codigo LIKE '2.%' AND conta_pai_id IS NULL;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '2.1') WHERE codigo LIKE '2.1.%' AND conta_pai_id IS NULL;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '2.3') WHERE codigo LIKE '2.3.%' AND conta_pai_id IS NULL;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '3') WHERE codigo LIKE '3.%' AND conta_pai_id IS NULL;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '3.1') WHERE codigo LIKE '3.1.%' AND conta_pai_id IS NULL;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '4') WHERE codigo LIKE '4.%' AND conta_pai_id IS NULL;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '4.1') WHERE codigo LIKE '4.1.%' AND conta_pai_id IS NULL;
UPDATE plano_contas SET conta_pai_id = (SELECT id FROM plano_contas WHERE codigo = '5') WHERE codigo LIKE '5.%' AND conta_pai_id IS NULL;

-- Centros de custo básicos
INSERT INTO centros_custo (codigo, descricao)
VALUES 
('ADM', 'Administrativo'),
('COM', 'Comercial'),
('FIN', 'Financeiro'),
('RH', 'Recursos Humanos'),
('TI', 'Tecnologia da Informação')
ON CONFLICT (codigo) DO NOTHING;

-- Configurar políticas de segurança do RLS (Row Level Security)
-- Habilitar RLS nas tabelas principais
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos_contabeis ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE socios ENABLE ROW LEVEL SECURITY;

-- Criar políticas para usuários autenticados
CREATE POLICY usuarios_policy ON usuarios
    USING (auth.uid() = id OR EXISTS (
        SELECT 1 FROM usuarios u
        WHERE u.id = auth.uid() AND u.perfil = 'ADMIN'
    ));

-- Política para lançamentos contábeis
CREATE POLICY lancamentos_policy ON lancamentos_contabeis
    USING (TRUE);

-- Política para documentos fiscais
CREATE POLICY documentos_policy ON documentos_fiscais
    USING (TRUE);

-- Política para funcionários
CREATE POLICY funcionarios_policy ON funcionarios
    USING (TRUE);

-- Política para ativos
CREATE POLICY ativos_policy ON ativos
    USING (TRUE);

-- Política para sócios
CREATE POLICY socios_policy ON socios
    USING (TRUE);

-- Conceder permissões ao papel anônimo (para autenticação)
GRANT USAGE ON SCHEMA sistema_contabil TO anon;
GRANT SELECT ON TABLE usuarios TO anon;

-- Conceder permissões ao papel autenticado
GRANT USAGE ON SCHEMA sistema_contabil TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA sistema_contabil TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA sistema_contabil TO authenticated;

-- Conceder permissões ao papel de serviço
GRANT USAGE ON SCHEMA sistema_contabil TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA sistema_contabil TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA sistema_contabil TO service_role;
