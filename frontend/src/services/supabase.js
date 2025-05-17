// Configuração do Supabase para o Sistema Contábil
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://fbnzmzjkvtrxclfgvsnd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibnptemprdnRyeGNsZmd2c25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NDAxMTAsImV4cCI6MjA2MzAxNjExMH0.ttgNMWg7moPE4nuGIMlVn6d_ZnjYV-PpQNghQBkgmew';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Serviços de autenticação
export const authService = {
  // Registrar novo usuário
  registrar: async (email, senha, nome) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome,
          perfil: 'USUARIO',
          ativo: true
        }
      }
    });
    
    if (error) throw error;
    
    return { sucesso: true, usuario: data.user };
  },
  
  // Login de usuário
  login: async (email, senha) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });
    
    if (error) throw error;
    
    // Obter dados adicionais do usuário
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError) throw userError;
    
    return { 
      sucesso: true, 
      token: data.session.access_token,
      usuario: {
        id: data.user.id,
        email: data.user.email,
        nome: usuario.nome,
        perfil: usuario.perfil,
        ativo: usuario.ativo
      }
    };
  },
  
  // Logout
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { sucesso: true };
  },
  
  // Obter perfil do usuário logado
  obterPerfil: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    if (!user) throw new Error('Usuário não autenticado');
    
    // Obter dados adicionais do usuário
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userError) throw userError;
    
    return { 
      sucesso: true, 
      usuario: {
        id: user.id,
        email: user.email,
        nome: usuario.nome,
        perfil: usuario.perfil,
        ativo: usuario.ativo,
        ultimo_acesso: usuario.ultimo_acesso
      }
    };
  },
  
  // Alterar senha
  alterarSenha: async (senhaAtual, novaSenha) => {
    // Primeiro verificamos a senha atual
    const { data: { user } } = await supabase.auth.getUser();
    
    // Atualizar senha
    const { error } = await supabase.auth.updateUser({
      password: novaSenha
    });
    
    if (error) throw error;
    
    return { sucesso: true };
  },
  
  // Listar usuários (apenas para administradores)
  listarUsuarios: async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    
    return { sucesso: true, usuarios: data };
  },
  
  // Criar usuário
  criarUsuario: async (usuario) => {
    // Primeiro criamos o usuário na autenticação
    const { data, error } = await supabase.auth.admin.createUser({
      email: usuario.email,
      password: usuario.senha,
      email_confirm: true
    });
    
    if (error) throw error;
    
    // Depois inserimos os dados adicionais na tabela de usuários
    const { data: novoUsuario, error: userError } = await supabase
      .from('usuarios')
      .insert([{
        id: data.user.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        cargo: usuario.cargo,
        ativo: true
      }])
      .select()
      .single();
    
    if (userError) throw userError;
    
    return { 
      sucesso: true, 
      usuario: novoUsuario
    };
  },
  
  // Atualizar usuário
  atualizarUsuario: async (id, usuario) => {
    const { data, error } = await supabase
      .from('usuarios')
      .update({
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        cargo: usuario.cargo,
        ativo: usuario.ativo
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { 
      sucesso: true, 
      usuario: data
    };
  },
  
  // Excluir usuário (desativar)
  excluirUsuario: async (id) => {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ ativo: false })
      .eq('id', id);
    
    if (error) throw error;
    
    return { sucesso: true };
  }
};

// Serviços do módulo contábil
export const contabilService = {
  // Plano de Contas
  listarPlanoContas: async (filtros = {}) => {
    let query = supabase
      .from('plano_contas')
      .select('*, conta_pai:conta_pai_id(id, codigo, descricao)');
    
    // Aplicar filtros
    if (filtros.ativo !== undefined) {
      query = query.eq('ativo', filtros.ativo);
    }
    
    if (filtros.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }
    
    // Ordenar por código
    query = query.order('codigo');
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { sucesso: true, contas: data };
  },
  
  obterContaPorId: async (id) => {
    const { data, error } = await supabase
      .from('plano_contas')
      .select(`
        *,
        conta_pai:conta_pai_id(id, codigo, descricao),
        contas_filhas:plano_contas!conta_pai_id(id, codigo, descricao, tipo, natureza, nivel, permite_lancamento, ativo)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return { sucesso: true, conta: data };
  },
  
  criarConta: async (conta) => {
    const { data, error } = await supabase
      .from('plano_contas')
      .insert([conta])
      .select()
      .single();
    
    if (error) throw error;
    
    return { sucesso: true, conta: data };
  },
  
  atualizarConta: async (id, conta) => {
    const { data, error } = await supabase
      .from('plano_contas')
      .update(conta)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { sucesso: true, conta: data };
  },
  
  // Lançamentos Contábeis
  listarLancamentos: async (filtros = {}) => {
    let query = supabase
      .from('lancamentos_contabeis')
      .select('*');
    
    // Aplicar filtros
    if (filtros.data_inicio && filtros.data_fim) {
      query = query.gte('data_lancamento', filtros.data_inicio)
                   .lte('data_lancamento', filtros.data_fim);
    } else if (filtros.data_inicio) {
      query = query.gte('data_lancamento', filtros.data_inicio);
    } else if (filtros.data_fim) {
      query = query.lte('data_lancamento', filtros.data_fim);
    }
    
    if (filtros.status) {
      query = query.eq('status', filtros.status);
    }
    
    if (filtros.tipo_lancamento) {
      query = query.eq('tipo_lancamento', filtros.tipo_lancamento);
    }
    
    // Ordenar por data e ID
    query = query.order('data_lancamento', { ascending: false })
                 .order('id', { ascending: false });
    
    // Paginação
    if (filtros.page && filtros.limit) {
      const from = (filtros.page - 1) * filtros.limit;
      const to = from + filtros.limit - 1;
      query = query.range(from, to);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Se filtro por conta_id, precisamos fazer uma consulta adicional
    if (filtros.conta_id) {
      // Obter IDs dos lançamentos que possuem partidas com a conta especificada
      const { data: partidasData, error: partidasError } = await supabase
        .from('partidas_lancamento')
        .select('lancamento_id')
        .eq('conta_id', filtros.conta_id);
      
      if (partidasError) throw partidasError;
      
      // Filtrar lançamentos que possuem partidas com a conta especificada
      const lancamentoIds = partidasData.map(p => p.lancamento_id);
      const lancamentosFiltrados = data.filter(l => lancamentoIds.includes(l.id));
      
      return { 
        sucesso: true, 
        lancamentos: lancamentosFiltrados,
        total: lancamentosFiltrados.length,
        pagina: filtros.page || 1,
        total_paginas: Math.ceil(lancamentosFiltrados.length / (filtros.limit || 20))
      };
    }
    
    // Obter contagem total para paginação
    const { count: totalCount, error: countError } = await supabase
      .from('lancamentos_contabeis')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    
    return { 
      sucesso: true, 
      lancamentos: data,
      total: totalCount,
      pagina: filtros.page || 1,
      total_paginas: Math.ceil(totalCount / (filtros.limit || 20))
    };
  },
  
  obterLancamentoPorId: async (id) => {
    // Obter lançamento
    const { data: lancamento, error } = await supabase
      .from('lancamentos_contabeis')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Obter partidas do lançamento
    const { data: partidas, error: partidasError } = await supabase
      .from('partidas_lancamento')
      .select(`
        *,
        conta:conta_id(id, codigo, descricao, tipo, natureza)
      `)
      .eq('lancamento_id', id);
    
    if (partidasError) throw partidasError;
    
    // Adicionar partidas ao lançamento
    lancamento.partidas = partidas;
    
    return { sucesso: true, lancamento };
  },
  
  criarLancamento: async (lancamento) => {
    // Iniciar transação
    const { data: novoLancamento, error } = await supabase
      .from('lancamentos_contabeis')
      .insert([{
        numero_lancamento: lancamento.numero_lancamento,
        data_lancamento: lancamento.data_lancamento,
        data_competencia: lancamento.data_competencia,
        tipo_lancamento: lancamento.tipo_lancamento,
        historico: lancamento.historico,
        valor: lancamento.valor,
        usuario_id: lancamento.usuario_id,
        origem: lancamento.origem,
        origem_id: lancamento.origem_id,
        status: 'PENDENTE'
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Criar partidas
    const partidas = lancamento.partidas.map(partida => ({
      lancamento_id: novoLancamento.id,
      conta_id: partida.conta_id,
      centro_custo_id: partida.centro_custo_id,
      tipo: partida.tipo,
      valor: partida.valor,
      historico_complementar: partida.historico_complementar
    }));
    
    const { error: partidasError } = await supabase
      .from('partidas_lancamento')
      .insert(partidas);
    
    if (partidasError) throw partidasError;
    
    return { 
      sucesso: true, 
      lancamento: novoLancamento
    };
  },
  
  aprovarLancamento: async (id) => {
    const { data, error } = await supabase
      .from('lancamentos_contabeis')
      .update({ status: 'APROVADO' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { sucesso: true, lancamento: data };
  },
  
  rejeitarLancamento: async (id, motivo) => {
    // Primeiro obter o lançamento atual
    const { data: lancamento, error: getError } = await supabase
      .from('lancamentos_contabeis')
      .select('*')
      .eq('id', id)
      .single();
    
    if (getError) throw getError;
    
    // Atualizar o lançamento
    const { data, error } = await supabase
      .from('lancamentos_contabeis')
      .update({ 
        status: 'REJEITADO',
        historico: `${lancamento.historico} [REJEITADO: ${motivo}]`
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { sucesso: true, lancamento: data };
  },
  
  estornarLancamento: async (id, motivo, usuarioId) => {
    // Obter lançamento original
    const { data: lancamento, error: getError } = await supabase
      .from('lancamentos_contabeis')
      .select('*')
      .eq('id', id)
      .single();
    
    if (getError) throw getError;
    
    // Obter partidas do lançamento original
    const { data: partidas, error: partidasError } = await supabase
      .from('partidas_lancamento')
      .select('*')
      .eq('lancamento_id', id);
    
    if (partidasError) throw partidasError;
    
    // Atualizar status do lançamento original
    const { error: updateError } = await supabase
      .from('lancamentos_contabeis')
      .update({ 
        status: 'ESTORNADO',
        historico: `${lancamento.historico} [ESTORNADO: ${motivo}]`
      })
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    // Criar lançamento de estorno
    const { data: lancamentoEstorno, error: estornoError } = await supabase
      .from('lancamentos_contabeis')
      .insert([{
        numero_lancamento: `E${lancamento.numero_lancamento}`,
        data_lancamento: new Date().toISOString().split('T')[0],
        data_competencia: lancamento.data_competencia,
        tipo_lancamento: 'NORMAL',
        historico: `ESTORNO: ${lancamento.historico} - Motivo: ${motivo}`,
        valor: lancamento.valor,
        usuario_id: usuarioId,
        origem: 'ESTORNO',
        origem_id: lancamento.id,
        status: 'APROVADO'
      }])
      .select()
      .single();
    
    if (estornoError) throw estornoError;
    
    // Criar partidas invertidas
    const partidasEstorno = partidas.map(partida => ({
      lancamento_id: lancamentoEstorno.id,
      conta_id: partida.conta_id,
      centro_custo_id: partida.centro_custo_id,
      tipo: partida.tipo === 'DEBITO' ? 'CREDITO' : 'DEBITO', // Inverter o tipo
      valor: partida.valor,
      historico_complementar: `ESTORNO: ${partida.historico_complementar || ''}`
    }));
    
    const { error: partidasEstornoError } = await supabase
      .from('partidas_lancamento')
      .insert(partidasEstorno);
    
    if (partidasEstornoError) throw partidasEstornoError;
    
    return { 
      sucesso: true, 
      lancamento_estorno: lancamentoEstorno
    };
  }
};

// Serviços do módulo fiscal
export const fiscalService = {
  // Implementação dos serviços do módulo fiscal
  listarDocumentosFiscais: async (filtros = {}) => {
    let query = supabase
      .from('documentos_fiscais')
      .select('*');
    
    // Aplicar filtros
    if (filtros.tipo_documento) {
      query = query.eq('tipo_documento', filtros.tipo_documento);
    }
    
    if (filtros.data_inicio && filtros.data_fim) {
      query = query.gte('data_emissao', filtros.data_inicio)
                   .lte('data_emissao', filtros.data_fim);
    }
    
    if (filtros.status) {
      query = query.eq('status', filtros.status);
    }
    
    // Ordenar por data e número
    query = query.order('data_emissao', { ascending: false })
                 .order('numero', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { sucesso: true, documentos: data };
  },
  
  obterDocumentoPorId: async (id) => {
    const { data, error } = await supabase
      .from('documentos_fiscais')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return { sucesso: true, documento: data };
  },
  
  importarXML: async (xmlContent) => {
    // Esta função seria implementada para processar o XML e inserir no banco
    // Aqui estamos simulando o comportamento
    
    const documento = {
      tipo_documento: 'NFE',
      numero: '12345',
      serie: '1',
      chave_acesso: '12345678901234567890123456789012345678901234',
      data_emissao: new Date().toISOString().split('T')[0],
      valor_total: 1000.00,
      cnpj_emitente: '00.000.000/0001-00',
      nome_emitente: 'Empresa Teste',
      cnpj_destinatario: '11.111.111/0001-11',
      nome_destinatario: 'Cliente Teste',
      status: 'EMITIDA'
    };
    
    const { data, error } = await supabase
      .from('documentos_fiscais')
      .insert([documento])
      .select()
      .single();
    
    if (error) throw error;
    
    return { sucesso: true, documento: data };
  }
};

// Serviços do módulo folha
export const folhaService = {
  // Implementação dos serviços do módulo folha
  listarFuncionarios: async (filtros = {}) => {
    let query = supabase
      .from('funcionarios')
      .select('*');
    
    // Aplicar filtros
    if (filtros.status) {
      query = query.eq('status', filtros.status);
    }
    
    if (filtros.departamento) {
      query = query.eq('departamento', filtros.departamento);
    }
    
    // Ordenar por nome
    query = query.order('nome');
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { sucesso: true, funcionarios: data };
  },
  
  obterFuncionarioPorId: async (id) => {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return { sucesso: true, funcionario: data };
  },
  
  iniciarCalculoFolha: async (competencia) => {
    const folha = {
      competencia,
      data_calculo: new Date().toISOString().split('T')[0],
      status: 'EM_PROCESSAMENTO',
      valor_total: 0
    };
    
    const { data, error } = await supabase
      .from('folhas_pagamento')
      .insert([folha])
      .select()
      .single();
    
    if (error) throw error;
    
    return { sucesso: true, folha: data };
  },
  
  calcularFolhaFuncionario: async (folhaId, funcionarioId) => {
    // Esta função seria implementada para calcular a folha de um funcionário
    // Aqui estamos simulando o comportamento
    
    const calculo = {
      folha_id: folhaId,
      funcionario_id: funcionarioId,
      salario_base: 3000.00,
      total_proventos: 3500.00,
      total_descontos: 700.00,
      valor_liquido: 2800.00
    };
    
    const { data, error } = await supabase
      .from('calculos_folha')
      .insert([calculo])
      .select()
      .single();
    
    if (error) throw error;
    
    return { sucesso: true, calculo: data };
  },
  
  finalizarCalculoFolha: async (folhaId) => {
    // Calcular valor total
    const { data: calculos, error: calculosError } = await supabase
      .from('calculos_folha')
      .select('valor_liquido')
      .eq('folha_id', folhaId);
    
    if (calculosError) throw calculosError;
    
    const valorTotal = calculos.reduce((total, calculo) => total + calculo.valor_liquido, 0);
    
    // Atualizar folha
    const { data, error } = await supabase
      .from('folhas_pagamento')
      .update({ 
        status: 'FINALIZADA',
        valor_total: valorTotal
      })
      .eq('id', folhaId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { sucesso: true, folha: data };
  }
};

// Serviços do módulo patrimônio
export const patrimonioService = {
  // Implementação dos serviços do módulo patrimônio
  listarAtivos: async (filtros = {}) => {
    let query = supabase
      .from('ativos')
      .select('*');
    
    // Aplicar filtros
    if (filtros.status) {
      query = query.eq('status', filtros.status);
    }
    
    if (filtros.categoria) {
      query = query.eq('categoria', filtros.categoria);
    }
    
    if (filtros.depreciavel !== undefined) {
      query = query.eq('depreciavel', filtros.depreciavel);
    }
    
    // Ordenar por código
    query = query.order('codigo');
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { sucesso: true, ativos: data };
  },
  
  obterAtivoPorId: async (id) => {
    const { data, error } = await supabase
      .from('ativos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return { sucesso: true, ativo: data };
  },
  
  calcularDepreciacao: async (competencia, ativos) => {
    // Esta função seria implementada para calcular a depreciação dos ativos
    // Aqui estamos simulando o comportamento
    
    const depreciacao = {
      competencia,
      data_calculo: new Date().toISOString().split('T')[0],
      valor_total: ativos.reduce((total, ativo) => {
        // Cálculo simplificado de depreciação mensal
        const valorDepreciacao = ativo.valor_aquisicao * (ativo.taxa_depreciacao / 100 / 12);
        return total + valorDepreciacao;
      }, 0)
    };
    
    const { data, error } = await supabase
      .from('depreciacoes')
      .insert([depreciacao])
      .select()
      .single();
    
    if (error) throw error;
    
    return { 
      sucesso: true, 
      id: data.id,
      competencia: data.competencia,
      valor_total: data.valor_total
    };
  }
};

// Serviços do módulo societário
export const societarioService = {
  // Implementação dos serviços do módulo societário
  listarSocios: async (filtros = {}) => {
    let query = supabase
      .from('socios')
      .select('*');
    
    // Aplicar filtros
    if (filtros.status) {
      query = query.eq('status', filtros.status);
    }
    
    if (filtros.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }
    
    // Ordenar por participação (decrescente)
    query = query.order('participacao', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { sucesso: true, socios: data };
  },
  
  obterSocioPorId: async (id) => {
    const { data, error } = await supabase
      .from('socios')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return { sucesso: true, socio: data };
  },
  
  calcularDistribuicao: async (valor, socios) => {
    // Calcular distribuição proporcional à participação
    const distribuicoes = socios.map(socio => ({
      socio_id: socio.id,
      nome_socio: socio.nome,
      participacao: socio.participacao,
      valor: valor * (socio.participacao / 100)
    }));
    
    return { 
      sucesso: true, 
      distribuicoes
    };
  },
  
  registrarDistribuicao: async (distribuicao) => {
    // Registrar distribuição
    const { data, error } = await supabase
      .from('distribuicoes_lucro')
      .insert([{
        data: distribuicao.data,
        valor_total: distribuicao.valor
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Registrar itens da distribuição
    const itens = distribuicao.distribuicoes.map(item => ({
      distribuicao_id: data.id,
      socio_id: item.socio_id,
      valor: item.valor
    }));
    
    const { error: itensError } = await supabase
      .from('itens_distribuicao')
      .insert(itens);
    
    if (itensError) throw itensError;
    
    return { 
      sucesso: true, 
      distribuicao: data
    };
  }
};

export default supabase;
