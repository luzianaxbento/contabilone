-- Schema do Banco de Dados do Sistema Contábil Completo
-- Versão 1.0.0

-- Configurações iniciais
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

-- Criação do schema
CREATE SCHEMA IF NOT EXISTS sistema_contabil;
SET search_path = sistema_contabil, public;

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabelas de configuração e usuários
CREATE TABLE configuracoes_sistema (
    id SERIAL PRIMARY KEY,
    nome_empresa VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) NOT NULL,
    regime_tributario VARCHAR(50) NOT NULL CHECK (regime_tributario IN ('LUCRO_REAL', 'LUCRO_PRESUMIDO', 'SIMPLES_NACIONAL', 'SCP')),
    data_inicio DATE NOT NULL,
    logo_url VARCHAR(255),
    tema_sistema VARCHAR(50) DEFAULT 'padrao',
    versao_sistema VARCHAR(20) NOT NULL,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_cnpj UNIQUE (cnpj)
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(100),
    perfil VARCHAR(50) NOT NULL CHECK (perfil IN ('ADMIN', 'CONTADOR', 'AUXILIAR', 'GERENTE', 'CONSULTA')),
    ativo BOOLEAN DEFAULT TRUE,
    ultimo_acesso TIMESTAMP WITH TIME ZONE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_email UNIQUE (email)
);

CREATE TABLE permissoes (
    id SERIAL PRIMARY KEY,
    perfil VARCHAR(50) NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    acao VARCHAR(50) NOT NULL,
    permitido BOOLEAN DEFAULT FALSE,
    CONSTRAINT uk_perfil_modulo_acao UNIQUE (perfil, modulo, acao)
);

CREATE TABLE logs_sistema (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    acao VARCHAR(255) NOT NULL,
    tabela_afetada VARCHAR(100),
    registro_id INTEGER,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_origem VARCHAR(45),
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabelas do Módulo Contábil
CREATE TABLE plano_contas (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ATIVO', 'PASSIVO', 'RECEITA', 'DESPESA', 'RESULTADO')),
    natureza VARCHAR(20) NOT NULL CHECK (natureza IN ('DEVEDORA', 'CREDORA')),
    nivel INTEGER NOT NULL,
    conta_pai_id INTEGER REFERENCES plano_contas(id),
    permite_lancamento BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    CONSTRAINT uk_codigo UNIQUE (codigo)
);

CREATE TABLE centros_custo (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    responsavel VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_codigo_centro_custo UNIQUE (codigo)
);

CREATE TABLE lancamentos_contabeis (
    id SERIAL PRIMARY KEY,
    numero_lancamento VARCHAR(50) NOT NULL,
    data_lancamento DATE NOT NULL,
    data_competencia DATE NOT NULL,
    tipo_lancamento VARCHAR(50) NOT NULL CHECK (tipo IN ('NORMAL', 'ABERTURA', 'ENCERRAMENTO', 'AJUSTE', 'RECLASSIFICACAO')),
    historico TEXT NOT NULL,
    valor NUMERIC(15,2) NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id),
    origem VARCHAR(50),
    origem_id INTEGER,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDENTE', 'APROVADO', 'REJEITADO', 'ESTORNADO')),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_numero_lancamento UNIQUE (numero_lancamento)
);

CREATE TABLE partidas_lancamento (
    id SERIAL PRIMARY KEY,
    lancamento_id INTEGER NOT NULL REFERENCES lancamentos_contabeis(id),
    conta_id INTEGER NOT NULL REFERENCES plano_contas(id),
    centro_custo_id INTEGER REFERENCES centros_custo(id),
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('DEBITO', 'CREDITO')),
    valor NUMERIC(15,2) NOT NULL,
    historico_complementar TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE periodos_contabeis (
    id SERIAL PRIMARY KEY,
    ano INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ABERTO', 'FECHADO', 'EM_PROCESSAMENTO')),
    data_abertura TIMESTAMP WITH TIME ZONE,
    data_fechamento TIMESTAMP WITH TIME ZONE,
    usuario_abertura_id INTEGER REFERENCES usuarios(id),
    usuario_fechamento_id INTEGER REFERENCES usuarios(id),
    observacoes TEXT,
    CONSTRAINT uk_ano_mes UNIQUE (ano, mes)
);

CREATE TABLE contas_bancarias (
    id SERIAL PRIMARY KEY,
    banco VARCHAR(100) NOT NULL,
    agencia VARCHAR(20) NOT NULL,
    conta VARCHAR(20) NOT NULL,
    tipo_conta VARCHAR(50) NOT NULL CHECK (tipo_conta IN ('CORRENTE', 'POUPANCA', 'INVESTIMENTO', 'PAGAMENTOS')),
    descricao VARCHAR(255) NOT NULL,
    conta_contabil_id INTEGER REFERENCES plano_contas(id),
    saldo_inicial NUMERIC(15,2) NOT NULL DEFAULT 0,
    data_saldo_inicial DATE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_banco_agencia_conta UNIQUE (banco, agencia, conta)
);

CREATE TABLE movimentos_bancarios (
    id SERIAL PRIMARY KEY,
    conta_bancaria_id INTEGER NOT NULL REFERENCES contas_bancarias(id),
    data_movimento DATE NOT NULL,
    tipo_movimento VARCHAR(50) NOT NULL CHECK (tipo_movimento IN ('CREDITO', 'DEBITO', 'TRANSFERENCIA', 'APLICACAO', 'RESGATE')),
    valor NUMERIC(15,2) NOT NULL,
    descricao TEXT NOT NULL,
    numero_documento VARCHAR(50),
    conciliado BOOLEAN DEFAULT FALSE,
    lancamento_contabil_id INTEGER REFERENCES lancamentos_contabeis(id),
    data_conciliacao TIMESTAMP WITH TIME ZONE,
    usuario_conciliacao_id INTEGER REFERENCES usuarios(id),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabelas do Módulo Fiscal
CREATE TABLE configuracoes_fiscais (
    id SERIAL PRIMARY KEY,
    regime_pis_cofins VARCHAR(50) NOT NULL CHECK (regime_pis_cofins IN ('CUMULATIVO', 'NAO_CUMULATIVO', 'AMBOS')),
    periodo_apuracao_irpj VARCHAR(50) NOT NULL CHECK (periodo_apuracao_irpj IN ('TRIMESTRAL', 'ANUAL')),
    optante_simples BOOLEAN DEFAULT FALSE,
    anexo_simples INTEGER CHECK (anexo_simples BETWEEN 1 AND 5),
    aliquota_simples NUMERIC(5,2),
    contribuinte_icms BOOLEAN DEFAULT TRUE,
    contribuinte_ipi BOOLEAN DEFAULT FALSE,
    regime_especial_tributacao VARCHAR(100),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documentos_fiscais (
    id SERIAL PRIMARY KEY,
    tipo_documento VARCHAR(50) NOT NULL CHECK (tipo_documento IN ('NFE', 'NFCE', 'CTE', 'NFSE', 'NFEM')),
    numero VARCHAR(20) NOT NULL,
    serie VARCHAR(10) NOT NULL,
    chave_acesso VARCHAR(44),
    data_emissao DATE NOT NULL,
    data_operacao DATE NOT NULL,
    valor_total NUMERIC(15,2) NOT NULL,
    valor_produtos NUMERIC(15,2) NOT NULL,
    valor_servicos NUMERIC(15,2) DEFAULT 0,
    valor_frete NUMERIC(15,2) DEFAULT 0,
    valor_seguro NUMERIC(15,2) DEFAULT 0,
    valor_desconto NUMERIC(15,2) DEFAULT 0,
    valor_outras_despesas NUMERIC(15,2) DEFAULT 0,
    valor_icms NUMERIC(15,2) DEFAULT 0,
    valor_icms_st NUMERIC(15,2) DEFAULT 0,
    valor_ipi NUMERIC(15,2) DEFAULT 0,
    valor_pis NUMERIC(15,2) DEFAULT 0,
    valor_cofins NUMERIC(15,2) DEFAULT 0,
    valor_iss NUMERIC(15,2) DEFAULT 0,
    cnpj_emitente VARCHAR(18) NOT NULL,
    nome_emitente VARCHAR(255) NOT NULL,
    cnpj_destinatario VARCHAR(18) NOT NULL,
    nome_destinatario VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('EMITIDA', 'CANCELADA', 'INUTILIZADA', 'DENEGADA')),
    xml_path VARCHAR(255),
    pdf_path VARCHAR(255),
    lancamento_contabil_id INTEGER REFERENCES lancamentos_contabeis(id),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_tipo_numero_serie_emitente UNIQUE (tipo_documento, numero, serie, cnpj_emitente)
);

CREATE TABLE itens_documento_fiscal (
    id SERIAL PRIMARY KEY,
    documento_fiscal_id INTEGER NOT NULL REFERENCES documentos_fiscais(id),
    numero_item INTEGER NOT NULL,
    codigo_produto VARCHAR(60) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    ncm VARCHAR(8),
    cfop VARCHAR(4) NOT NULL,
    unidade VARCHAR(6) NOT NULL,
    quantidade NUMERIC(15,4) NOT NULL,
    valor_unitario NUMERIC(15,4) NOT NULL,
    valor_total NUMERIC(15,2) NOT NULL,
    valor_desconto NUMERIC(15,2) DEFAULT 0,
    cst_icms VARCHAR(3),
    base_calculo_icms NUMERIC(15,2) DEFAULT 0,
    aliquota_icms NUMERIC(5,2) DEFAULT 0,
    valor_icms NUMERIC(15,2) DEFAULT 0,
    cst_ipi VARCHAR(2),
    base_calculo_ipi NUMERIC(15,2) DEFAULT 0,
    aliquota_ipi NUMERIC(5,2) DEFAULT 0,
    valor_ipi NUMERIC(15,2) DEFAULT 0,
    cst_pis VARCHAR(2),
    base_calculo_pis NUMERIC(15,2) DEFAULT 0,
    aliquota_pis NUMERIC(5,2) DEFAULT 0,
    valor_pis NUMERIC(15,2) DEFAULT 0,
    cst_cofins VARCHAR(2),
    base_calculo_cofins NUMERIC(15,2) DEFAULT 0,
    aliquota_cofins NUMERIC(5,2) DEFAULT 0,
    valor_cofins NUMERIC(15,2) DEFAULT 0,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_documento_numero_item UNIQUE (documento_fiscal_id, numero_item)
);

CREATE TABLE apuracoes_fiscais (
    id SERIAL PRIMARY KEY,
    tipo_imposto VARCHAR(50) NOT NULL CHECK (tipo_imposto IN ('ICMS', 'IPI', 'PIS', 'COFINS', 'ISS', 'IRPJ', 'CSLL')),
    periodo_referencia VARCHAR(7) NOT NULL, -- Formato: YYYY-MM
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    valor_debito NUMERIC(15,2) DEFAULT 0,
    valor_credito NUMERIC(15,2) DEFAULT 0,
    valor_saldo NUMERIC(15,2) DEFAULT 0,
    status VARCHAR(50) NOT NULL CHECK (status IN ('EM_PROCESSAMENTO', 'CONCLUIDA', 'TRANSMITIDA', 'RETIFICADA')),
    data_transmissao TIMESTAMP WITH TIME ZONE,
    usuario_transmissao_id INTEGER REFERENCES usuarios(id),
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_tipo_imposto_periodo UNIQUE (tipo_imposto, periodo_referencia)
);

CREATE TABLE obrigacoes_acessorias (
    id SERIAL PRIMARY KEY,
    tipo_obrigacao VARCHAR(50) NOT NULL CHECK (tipo_obrigacao IN ('EFD_ICMS_IPI', 'EFD_CONTRIBUICOES', 'ECD', 'ECF', 'DCTF', 'SPED_REINF', 'ESOCIAL', 'MIT')),
    periodo_referencia VARCHAR(7) NOT NULL, -- Formato: YYYY-MM
    prazo_entrega DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDENTE', 'EM_PROCESSAMENTO', 'TRANSMITIDA', 'RETIFICADA', 'ERRO')),
    data_transmissao TIMESTAMP WITH TIME ZONE,
    protocolo VARCHAR(50),
    recibo VARCHAR(50),
    arquivo_path VARCHAR(255),
    usuario_transmissao_id INTEGER REFERENCES usuarios(id),
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_tipo_obrigacao_periodo UNIQUE (tipo_obrigacao, periodo_referencia)
);

CREATE TABLE guias_pagamento (
    id SERIAL PRIMARY KEY,
    tipo_imposto VARCHAR(50) NOT NULL,
    periodo_referencia VARCHAR(7) NOT NULL, -- Formato: YYYY-MM
    data_vencimento DATE NOT NULL,
    valor NUMERIC(15,2) NOT NULL,
    codigo_barras VARCHAR(100),
    numero_documento VARCHAR(50),
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDENTE', 'PAGA', 'CANCELADA', 'VENCIDA')),
    data_pagamento DATE,
    valor_pago NUMERIC(15,2),
    valor_juros NUMERIC(15,2) DEFAULT 0,
    valor_multa NUMERIC(15,2) DEFAULT 0,
    conta_bancaria_id INTEGER REFERENCES contas_bancarias(id),
    lancamento_contabil_id INTEGER REFERENCES lancamentos_contabeis(id),
    apuracao_fiscal_id INTEGER REFERENCES apuracoes_fiscais(id),
    arquivo_path VARCHAR(255),
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabelas do Módulo Folha de Pagamento
CREATE TABLE departamentos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    responsavel VARCHAR(100),
    centro_custo_id INTEGER REFERENCES centros_custo(id),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_codigo_departamento UNIQUE (codigo)
);

CREATE TABLE cargos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    salario_base NUMERIC(15,2),
    cbo VARCHAR(6),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_codigo_cargo UNIQUE (codigo)
);

CREATE TABLE funcionarios (
    id SERIAL PRIMARY KEY,
    matricula VARCHAR(20) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    rg VARCHAR(20),
    data_nascimento DATE NOT NULL,
    sexo CHAR(1) NOT NULL CHECK (sexo IN ('M', 'F')),
    estado_civil VARCHAR(20) CHECK (estado_civil IN ('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO', 'UNIAO_ESTAVEL')),
    endereco VARCHAR(255) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    pis VARCHAR(14) NOT NULL,
    data_admissao DATE NOT NULL,
    data_demissao DATE,
    tipo_contrato VARCHAR(50) NOT NULL CHECK (tipo_contrato IN ('CLT', 'TEMPORARIO', 'ESTAGIO', 'AUTONOMO', 'PJ')),
    cargo_id INTEGER NOT NULL REFERENCES cargos(id),
    departamento_id INTEGER NOT NULL REFERENCES departamentos(id),
    salario NUMERIC(15,2) NOT NULL,
    conta_bancaria VARCHAR(20),
    agencia_bancaria VARCHAR(10),
    banco VARCHAR(50),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ATIVO', 'INATIVO', 'AFASTADO', 'FERIAS', 'DEMITIDO')),
    foto_path VARCHAR(255),
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_matricula UNIQUE (matricula),
    CONSTRAINT uk_cpf UNIQUE (cpf),
    CONSTRAINT uk_pis UNIQUE (pis)
);

CREATE TABLE dependentes (
    id SERIAL PRIMARY KEY,
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id),
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    data_nascimento DATE NOT NULL,
    parentesco VARCHAR(50) NOT NULL CHECK (parentesco IN ('FILHO', 'CONJUGE', 'PAI', 'MAE', 'OUTRO')),
    recebe_salario_familia BOOLEAN DEFAULT FALSE,
    recebe_pensao BOOLEAN DEFAULT FALSE,
    valor_pensao NUMERIC(15,2),
    inclui_ir BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE folhas_pagamento (
    id SERIAL PRIMARY KEY,
    competencia VARCHAR(7) NOT NULL, -- Formato: YYYY-MM
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('MENSAL', 'FERIAS', 'DECIMO_TERCEIRO', 'RESCISAO', 'ADIANTAMENTO')),
    data_inicio_calculo DATE NOT NULL,
    data_fim_calculo DATE NOT NULL,
    data_pagamento DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('EM_PROCESSAMENTO', 'CALCULADA', 'FECHADA', 'PAGA', 'CANCELADA')),
    observacoes TEXT,
    usuario_processamento_id INTEGER REFERENCES usuarios(id),
    data_processamento TIMESTAMP WITH TIME ZONE,
    lancamento_contabil_id INTEGER REFERENCES lancamentos_contabeis(id),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_competencia_tipo UNIQUE (competencia, tipo)
);

CREATE TABLE eventos_folha (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('PROVENTO', 'DESCONTO', 'INFORMATIVO')),
    incide_inss BOOLEAN DEFAULT FALSE,
    incide_irrf BOOLEAN DEFAULT FALSE,
    incide_fgts BOOLEAN DEFAULT FALSE,
    formula TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_codigo_evento UNIQUE (codigo)
);

CREATE TABLE calculos_folha (
    id SERIAL PRIMARY KEY,
    folha_pagamento_id INTEGER NOT NULL REFERENCES folhas_pagamento(id),
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id),
    salario_base NUMERIC(15,2) NOT NULL,
    salario_calculado NUMERIC(15,2) NOT NULL,
    total_proventos NUMERIC(15,2) NOT NULL,
    total_descontos NUMERIC(15,2) NOT NULL,
    liquido_a_receber NUMERIC(15,2) NOT NULL,
    base_inss NUMERIC(15,2) NOT NULL,
    base_fgts NUMERIC(15,2) NOT NULL,
    base_irrf NUMERIC(15,2) NOT NULL,
    valor_inss NUMERIC(15,2) NOT NULL,
    valor_fgts NUMERIC(15,2) NOT NULL,
    valor_irrf NUMERIC(15,2) NOT NULL,
    data_calculo TIMESTAMP WITH TIME ZONE NOT NULL,
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_folha_funcionario UNIQUE (folha_pagamento_id, funcionario_id)
);

CREATE TABLE itens_calculo_folha (
    id SERIAL PRIMARY KEY,
    calculo_folha_id INTEGER NOT NULL REFERENCES calculos_folha(id),
    evento_id INTEGER NOT NULL REFERENCES eventos_folha(id),
    referencia VARCHAR(20),
    valor NUMERIC(15,2) NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_calculo_evento UNIQUE (calculo_folha_id, evento_id)
);

CREATE TABLE ferias (
    id SERIAL PRIMARY KEY,
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id),
    periodo_aquisitivo_inicio DATE NOT NULL,
    periodo_aquisitivo_fim DATE NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    dias_gozados INTEGER NOT NULL,
    dias_vendidos INTEGER DEFAULT 0,
    valor_bruto NUMERIC(15,2),
    valor_liquido NUMERIC(15,2),
    status VARCHAR(50) NOT NULL CHECK (status IN ('PROGRAMADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA')),
    folha_pagamento_id INTEGER REFERENCES folhas_pagamento(id),
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE decimo_terceiro (
    id SERIAL PRIMARY KEY,
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id),
    ano INTEGER NOT NULL,
    valor_primeira_parcela NUMERIC(15,2),
    data_pagamento_primeira DATE,
    valor_segunda_parcela NUMERIC(15,2),
    data_pagamento_segunda DATE,
    valor_total NUMERIC(15,2),
    folha_pagamento_primeira_id INTEGER REFERENCES folhas_pagamento(id),
    folha_pagamento_segunda_id INTEGER REFERENCES folhas_pagamento(id),
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_funcionario_ano UNIQUE (funcionario_id, ano)
);

CREATE TABLE esocial_eventos (
    id SERIAL PRIMARY KEY,
    tipo_evento VARCHAR(50) NOT NULL,
    numero_recibo VARCHAR(50),
    id_evento VARCHAR(50) NOT NULL,
    funcionario_id INTEGER REFERENCES funcionarios(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDENTE', 'ENVIADO', 'PROCESSADO', 'ERRO')),
    data_evento TIMESTAMP WITH TIME ZONE NOT NULL,
    data_envio TIMESTAMP WITH TIME ZONE,
    xml_envio TEXT,
    xml_retorno TEXT,
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabelas do Módulo Patrimônio
CREATE TABLE categorias_ativo (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    vida_util_anos INTEGER NOT NULL,
    taxa_depreciacao_anual NUMERIC(5,2) NOT NULL,
    conta_ativo_id INTEGER REFERENCES plano_contas(id),
    conta_depreciacao_id INTEGER REFERENCES plano_contas(id),
    conta_despesa_depreciacao_id INTEGER REFERENCES plano_contas(id),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_codigo_categoria UNIQUE (codigo)
);

CREATE TABLE ativos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    categoria_id INTEGER NOT NULL REFERENCES categorias_ativo(id),
    data_aquisicao DATE NOT NULL,
    valor_aquisicao NUMERIC(15,2) NOT NULL,
    valor_residual NUMERIC(15,2) DEFAULT 0,
    vida_util_meses INTEGER NOT NULL,
    metodo_depreciacao VARCHAR(50) NOT NULL CHECK (metodo_depreciacao IN ('LINEAR', 'SOMA_DIGITOS', 'HORAS_TRABALHADAS')),
    numero_nota_fiscal VARCHAR(20),
    fornecedor VARCHAR(255),
    localizacao VARCHAR(100),
    responsavel VARCHAR(100),
    status VARCHAR(50) NOT NULL CHECK (status IN ('ATIVO', 'BAIXADO', 'VENDIDO', 'OBSOLETO', 'MANUTENCAO')),
    data_baixa DATE,
    motivo_baixa TEXT,
    valor_baixa NUMERIC(15,2),
    centro_custo_id INTEGER REFERENCES centros_custo(id),
    departamento_id INTEGER REFERENCES departamentos(id),
    lancamento_aquisicao_id INTEGER REFERENCES lancamentos_contabeis(id),
    lancamento_baixa_id INTEGER REFERENCES lancamentos_contabeis(id),
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_codigo_ativo UNIQUE (codigo)
);

CREATE TABLE depreciacoes (
    id SERIAL PRIMARY KEY,
    ativo_id INTEGER NOT NULL REFERENCES ativos(id),
    data_referencia DATE NOT NULL,
    valor_depreciado NUMERIC(15,2) NOT NULL,
    valor_acumulado NUMERIC(15,2) NOT NULL,
    valor_liquido NUMERIC(15,2) NOT NULL,
    lancamento_contabil_id INTEGER REFERENCES lancamentos_contabeis(id),
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_ativo_data UNIQUE (ativo_id, data_referencia)
);

CREATE TABLE movimentacoes_ativo (
    id SERIAL PRIMARY KEY,
    ativo_id INTEGER NOT NULL REFERENCES ativos(id),
    tipo_movimentacao VARCHAR(50) NOT NULL CHECK (tipo_movimentacao IN ('TRANSFERENCIA', 'MANUTENCAO', 'REAVALIACAO', 'INVENTARIO')),
    data_movimentacao DATE NOT NULL,
    localizacao_origem VARCHAR(100),
    localizacao_destino VARCHAR(100),
    responsavel_origem VARCHAR(100),
    responsavel_destino VARCHAR(100),
    centro_custo_origem_id INTEGER REFERENCES centros_custo(id),
    centro_custo_destino_id INTEGER REFERENCES centros_custo(id),
    valor_anterior NUMERIC(15,2),
    valor_novo NUMERIC(15,2),
    motivo TEXT,
    lancamento_contabil_id INTEGER REFERENCES lancamentos_contabeis(id),
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventarios_patrimonio (
    id SERIAL PRIMARY KEY,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    responsavel VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')),
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE itens_inventario (
    id SERIAL PRIMARY KEY,
    inventario_id INTEGER NOT NULL REFERENCES inventarios_patrimonio(id),
    ativo_id INTEGER NOT NULL REFERENCES ativos(id),
    localizado BOOLEAN DEFAULT FALSE,
    estado_conservacao VARCHAR(50) CHECK (estado_conservacao IN ('OTIMO', 'BOM', 'REGULAR', 'RUIM', 'PESSIMO')),
    observacoes TEXT,
    data_verificacao TIMESTAMP WITH TIME ZONE,
    usuario_verificacao_id INTEGER REFERENCES usuarios(id),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_inventario_ativo UNIQUE (inventario_id, ativo_id)
);

-- Tabelas do Módulo Societário
CREATE TABLE socios (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('PESSOA_FISICA', 'PESSOA_JURIDICA')),
    nome VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(18) NOT NULL,
    data_nascimento DATE,
    endereco VARCHAR(255),
    telefone VARCHAR(20),
    email VARCHAR(255),
    data_entrada DATE NOT NULL,
    data_saida DATE,
    ativo BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_cpf_cnpj UNIQUE (cpf_cnpj)
);

CREATE TABLE capital_social (
    id SERIAL PRIMARY KEY,
    valor_total NUMERIC(15,2) NOT NULL,
    quantidade_quotas INTEGER NOT NULL,
    valor_quota NUMERIC(15,2) NOT NULL,
    data_registro DATE NOT NULL,
    numero_registro VARCHAR(50),
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE participacoes_societarias (
    id SERIAL PRIMARY KEY,
    socio_id INTEGER NOT NULL REFERENCES socios(id),
    capital_social_id INTEGER NOT NULL REFERENCES capital_social(id),
    quantidade_quotas INTEGER NOT NULL,
    valor_total NUMERIC(15,2) NOT NULL,
    percentual NUMERIC(5,2) NOT NULL,
    data_integralizacao DATE,
    valor_integralizado NUMERIC(15,2) DEFAULT 0,
    valor_a_integralizar NUMERIC(15,2) DEFAULT 0,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_socio_capital UNIQUE (socio_id, capital_social_id)
);

CREATE TABLE distribuicoes_lucro (
    id SERIAL PRIMARY KEY,
    data_distribuicao DATE NOT NULL,
    valor_total NUMERIC(15,2) NOT NULL,
    periodo_referencia VARCHAR(7) NOT NULL, -- Formato: YYYY-MM
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('DIVIDENDOS', 'JUROS_CAPITAL_PROPRIO', 'PRO_LABORE')),
    data_pagamento DATE,
    lancamento_contabil_id INTEGER REFERENCES lancamentos_contabeis(id),
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE itens_distribuicao_lucro (
    id SERIAL PRIMARY KEY,
    distribuicao_id INTEGER NOT NULL REFERENCES distribuicoes_lucro(id),
    socio_id INTEGER NOT NULL REFERENCES socios(id),
    percentual NUMERIC(5,2) NOT NULL,
    valor NUMERIC(15,2) NOT NULL,
    imposto_retido NUMERIC(15,2) DEFAULT 0,
    valor_liquido NUMERIC(15,2) NOT NULL,
    data_pagamento DATE,
    forma_pagamento VARCHAR(50),
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_distribuicao_socio UNIQUE (distribuicao_id, socio_id)
);

CREATE TABLE reunioes_assembleias (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('ASSEMBLEIA_GERAL_ORDINARIA', 'ASSEMBLEIA_GERAL_EXTRAORDINARIA', 'REUNIAO_SOCIOS', 'REUNIAO_DIRETORIA', 'REUNIAO_CONSELHO')),
    data_realizacao TIMESTAMP WITH TIME ZONE NOT NULL,
    local VARCHAR(255) NOT NULL,
    pauta TEXT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('AGENDADA', 'REALIZADA', 'CANCELADA')),
    ata_path VARCHAR(255),
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE participantes_reuniao (
    id SERIAL PRIMARY KEY,
    reuniao_id INTEGER NOT NULL REFERENCES reunioes_assembleias(id),
    socio_id INTEGER REFERENCES socios(id),
    nome VARCHAR(255),
    cargo VARCHAR(100),
    presente BOOLEAN DEFAULT FALSE,
    observacoes TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar performance
CREATE INDEX idx_lancamentos_data ON lancamentos_contabeis(data_lancamento);
CREATE INDEX idx_lancamentos_competencia ON lancamentos_contabeis(data_competencia);
CREATE INDEX idx_partidas_lancamento ON partidas_lancamento(lancamento_id);
CREATE INDEX idx_partidas_conta ON partidas_lancamento(conta_id);
CREATE INDEX idx_documentos_data ON documentos_fiscais(data_emissao);
CREATE INDEX idx_documentos_emitente ON documentos_fiscais(cnpj_emitente);
CREATE INDEX idx_documentos_destinatario ON documentos_fiscais(cnpj_destinatario);
CREATE INDEX idx_itens_documento ON itens_documento_fiscal(documento_fiscal_id);
CREATE INDEX idx_funcionarios_departamento ON funcionarios(departamento_id);
CREATE INDEX idx_funcionarios_status ON funcionarios(status);
CREATE INDEX idx_calculos_folha ON calculos_folha(folha_pagamento_id);
CREATE INDEX idx_calculos_funcionario ON calculos_folha(funcionario_id);
CREATE INDEX idx_ativos_categoria ON ativos(categoria_id);
CREATE INDEX idx_ativos_status ON ativos(status);
CREATE INDEX idx_depreciacoes_ativo ON depreciacoes(ativo_id);
CREATE INDEX idx_participacoes_socio ON participacoes_societarias(socio_id);

-- Funções e Triggers
CREATE OR REPLACE FUNCTION atualiza_data_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de atualização de data em todas as tabelas
DO $$
DECLARE
    tabela RECORD;
BEGIN
    FOR tabela IN (SELECT tablename FROM pg_tables WHERE schemaname = 'sistema_contabil')
    LOOP
        EXECUTE format('
            CREATE TRIGGER tr_atualiza_data_atualizacao
            BEFORE UPDATE ON sistema_contabil.%I
            FOR EACH ROW
            EXECUTE FUNCTION atualiza_data_atualizacao();
        ', tabela.tablename);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para validar partidas de lançamento (débito = crédito)
CREATE OR REPLACE FUNCTION validar_partidas_lancamento()
RETURNS TRIGGER AS $$
DECLARE
    total_debito NUMERIC(15,2);
    total_credito NUMERIC(15,2);
BEGIN
    SELECT COALESCE(SUM(valor), 0) INTO total_debito
    FROM sistema_contabil.partidas_lancamento
    WHERE lancamento_id = NEW.lancamento_id AND tipo = 'DEBITO';
    
    SELECT COALESCE(SUM(valor), 0) INTO total_credito
    FROM sistema_contabil.partidas_lancamento
    WHERE lancamento_id = NEW.lancamento_id AND tipo = 'CREDITO';
    
    IF total_debito != total_credito THEN
        RAISE EXCEPTION 'Total de débitos (%) deve ser igual ao total de créditos (%)', total_debito, total_credito;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_validar_partidas_lancamento
AFTER INSERT OR UPDATE ON sistema_contabil.partidas_lancamento
FOR EACH ROW
EXECUTE FUNCTION validar_partidas_lancamento();

-- Inserções iniciais
INSERT INTO sistema_contabil.configuracoes_sistema 
(nome_empresa, cnpj, regime_tributario, data_inicio, versao_sistema)
VALUES 
('Empresa Modelo', '00.000.000/0001-00', 'LUCRO_REAL', '2025-01-01', '1.0.0');

INSERT INTO sistema_contabil.usuarios 
(nome, email, senha, cargo, perfil)
VALUES 
('Administrador', 'admin@sistema.com', crypt('admin123', gen_salt('bf')), 'Administrador do Sistema', 'ADMIN');

-- Fim do script de criação do banco de dados
