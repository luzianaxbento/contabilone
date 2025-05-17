// Adaptação do controlador contábil para uso com Supabase
const supabase = require('../config/supabase');

// Controlador do módulo contábil
const contabilController = {
  // Plano de Contas
  listarPlanoContas: async (req, res) => {
    try {
      const { ativo, tipo } = req.query;
      
      let query = supabase
        .from('plano_contas')
        .select('*, conta_pai:conta_pai_id(id, codigo, descricao)');
      
      // Aplicar filtros
      if (ativo !== undefined) {
        query = query.eq('ativo', ativo === 'true');
      }
      
      if (tipo) {
        query = query.eq('tipo', tipo);
      }
      
      // Ordenar por código
      query = query.order('codigo');
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return res.status(200).json({
        sucesso: true,
        contas: data
      });
    } catch (error) {
      console.error('Erro ao listar plano de contas:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar plano de contas'
      });
    }
  },
  
  obterContaPorId: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('plano_contas')
        .select(`
          *,
          conta_pai:conta_pai_id(id, codigo, descricao),
          contas_filhas:plano_contas!conta_pai_id(id, codigo, descricao, tipo, natureza, nivel, permite_lancamento, ativo)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Conta não encontrada'
        });
      }
      
      return res.status(200).json({
        sucesso: true,
        conta: data
      });
    } catch (error) {
      console.error('Erro ao obter conta:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao obter conta'
      });
    }
  },
  
  criarConta: async (req, res) => {
    try {
      const { 
        codigo, 
        descricao, 
        tipo, 
        natureza, 
        nivel, 
        conta_pai_id, 
        permite_lancamento 
      } = req.body;
      
      // Validar campos obrigatórios
      if (!codigo || !descricao || !tipo || !natureza || !nivel) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Campos obrigatórios não informados'
        });
      }
      
      // Verificar se o código já existe
      const { data: contaExistente, error: checkError } = await supabase
        .from('plano_contas')
        .select('id')
        .eq('codigo', codigo)
        .maybeSingle();
      
      if (contaExistente) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Já existe uma conta com este código'
        });
      }
      
      // Criar conta
      const { data, error } = await supabase
        .from('plano_contas')
        .insert([{
          codigo,
          descricao,
          tipo,
          natureza,
          nivel,
          conta_pai_id,
          permite_lancamento: permite_lancamento || false,
          ativo: true
        }])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return res.status(201).json({
        sucesso: true,
        conta: data
      });
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao criar conta'
      });
    }
  },
  
  atualizarConta: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        codigo, 
        descricao, 
        tipo, 
        natureza, 
        nivel, 
        conta_pai_id, 
        permite_lancamento,
        ativo
      } = req.body;
      
      // Validar campos obrigatórios
      if (!codigo || !descricao || !tipo || !natureza || !nivel) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Campos obrigatórios não informados'
        });
      }
      
      // Verificar se a conta existe
      const { data: contaExistente, error: checkError } = await supabase
        .from('plano_contas')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      if (!contaExistente) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Conta não encontrada'
        });
      }
      
      // Verificar se o código já existe em outra conta
      const { data: codigoExistente, error: codeCheckError } = await supabase
        .from('plano_contas')
        .select('id')
        .eq('codigo', codigo)
        .neq('id', id)
        .maybeSingle();
      
      if (codigoExistente) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Já existe outra conta com este código'
        });
      }
      
      // Atualizar conta
      const { data, error } = await supabase
        .from('plano_contas')
        .update({
          codigo,
          descricao,
          tipo,
          natureza,
          nivel,
          conta_pai_id,
          permite_lancamento: permite_lancamento || false,
          ativo: ativo !== undefined ? ativo : true
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return res.status(200).json({
        sucesso: true,
        conta: data
      });
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao atualizar conta'
      });
    }
  },
  
  // Lançamentos Contábeis
  listarLancamentos: async (req, res) => {
    try {
      const { 
        data_inicio, 
        data_fim, 
        status, 
        tipo_lancamento, 
        conta_id,
        page = 1,
        limit = 20
      } = req.query;
      
      let query = supabase
        .from('lancamentos_contabeis')
        .select('*');
      
      // Aplicar filtros
      if (data_inicio && data_fim) {
        query = query.gte('data_lancamento', data_inicio)
                     .lte('data_lancamento', data_fim);
      } else if (data_inicio) {
        query = query.gte('data_lancamento', data_inicio);
      } else if (data_fim) {
        query = query.lte('data_lancamento', data_fim);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (tipo_lancamento) {
        query = query.eq('tipo_lancamento', tipo_lancamento);
      }
      
      // Ordenar por data e ID
      query = query.order('data_lancamento', { ascending: false })
                   .order('id', { ascending: false });
      
      // Paginação
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) {
        throw error;
      }
      
      // Se filtro por conta_id, precisamos fazer uma consulta adicional
      if (conta_id) {
        // Obter IDs dos lançamentos que possuem partidas com a conta especificada
        const { data: partidasData, error: partidasError } = await supabase
          .from('partidas_lancamento')
          .select('lancamento_id')
          .eq('conta_id', conta_id);
        
        if (partidasError) {
          throw partidasError;
        }
        
        // Filtrar lançamentos que possuem partidas com a conta especificada
        const lancamentoIds = partidasData.map(p => p.lancamento_id);
        const lancamentosFiltrados = data.filter(l => lancamentoIds.includes(l.id));
        
        // Obter contagem total para paginação
        const totalCount = lancamentosFiltrados.length;
        
        return res.status(200).json({ 
          sucesso: true, 
          lancamentos: lancamentosFiltrados,
          total: totalCount,
          pagina: parseInt(page),
          total_paginas: Math.ceil(totalCount / limit)
        });
      }
      
      // Obter contagem total para paginação
      const { count: totalCount, error: countError } = await supabase
        .from('lancamentos_contabeis')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        throw countError;
      }
      
      return res.status(200).json({ 
        sucesso: true, 
        lancamentos: data,
        total: totalCount,
        pagina: parseInt(page),
        total_paginas: Math.ceil(totalCount / limit)
      });
    } catch (error) {
      console.error('Erro ao listar lançamentos:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao listar lançamentos'
      });
    }
  },
  
  obterLancamentoPorId: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Obter lançamento
      const { data: lancamento, error } = await supabase
        .from('lancamentos_contabeis')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Lançamento não encontrado'
        });
      }
      
      // Obter partidas do lançamento
      const { data: partidas, error: partidasError } = await supabase
        .from('partidas_lancamento')
        .select(`
          *,
          conta:conta_id(id, codigo, descricao, tipo, natureza)
        `)
        .eq('lancamento_id', id);
      
      if (partidasError) {
        throw partidasError;
      }
      
      // Adicionar partidas ao lançamento
      lancamento.partidas = partidas;
      
      return res.status(200).json({
        sucesso: true,
        lancamento
      });
    } catch (error) {
      console.error('Erro ao obter lançamento:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao obter lançamento'
      });
    }
  },
  
  criarLancamento: async (req, res) => {
    try {
      const {
        numero_lancamento,
        data_lancamento,
        data_competencia,
        tipo_lancamento,
        historico,
        valor,
        partidas,
        origem,
        origem_id
      } = req.body;
      
      // Validar campos obrigatórios
      if (!numero_lancamento || !data_lancamento || !data_competencia || !tipo_lancamento || !historico || !valor || !partidas || partidas.length < 2) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Campos obrigatórios não informados ou partidas insuficientes'
        });
      }
      
      // Verificar se o número de lançamento já existe
      const { data: lancamentoExistente, error: checkError } = await supabase
        .from('lancamentos_contabeis')
        .select('id')
        .eq('numero_lancamento', numero_lancamento)
        .maybeSingle();
      
      if (lancamentoExistente) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Já existe um lançamento com este número'
        });
      }
      
      // Verificar se o total de débitos é igual ao total de créditos
      let totalDebitos = 0;
      let totalCreditos = 0;
      
      partidas.forEach(partida => {
        if (partida.tipo === 'DEBITO') {
          totalDebitos += parseFloat(partida.valor);
        } else if (partida.tipo === 'CREDITO') {
          totalCreditos += parseFloat(partida.valor);
        }
      });
      
      if (Math.abs(totalDebitos - totalCreditos) > 0.01) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'O total de débitos deve ser igual ao total de créditos'
        });
      }
      
      // Iniciar transação
      const { data: novoLancamento, error } = await supabase
        .from('lancamentos_contabeis')
        .insert([{
          numero_lancamento,
          data_lancamento,
          data_competencia,
          tipo_lancamento,
          historico,
          valor,
          usuario_id: req.user.id,
          origem,
          origem_id,
          status: 'PENDENTE'
        }])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Criar partidas
      const partidasInsert = partidas.map(partida => ({
        lancamento_id: novoLancamento.id,
        conta_id: partida.conta_id,
        centro_custo_id: partida.centro_custo_id,
        tipo: partida.tipo,
        valor: partida.valor,
        historico_complementar: partida.historico_complementar
      }));
      
      const { error: partidasError } = await supabase
        .from('partidas_lancamento')
        .insert(partidasInsert);
      
      if (partidasError) {
        // Tentar remover o lançamento em caso de erro
        await supabase
          .from('lancamentos_contabeis')
          .delete()
          .eq('id', novoLancamento.id);
        
        throw partidasError;
      }
      
      return res.status(201).json({ 
        sucesso: true, 
        lancamento: novoLancamento
      });
    } catch (error) {
      console.error('Erro ao criar lançamento:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao criar lançamento'
      });
    }
  },
  
  aprovarLancamento: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se o lançamento existe
      const { data: lancamentoExistente, error: checkError } = await supabase
        .from('lancamentos_contabeis')
        .select('status')
        .eq('id', id)
        .single();
      
      if (!lancamentoExistente) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Lançamento não encontrado'
        });
      }
      
      if (lancamentoExistente.status !== 'PENDENTE') {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Apenas lançamentos pendentes podem ser aprovados'
        });
      }
      
      // Aprovar lançamento
      const { data, error } = await supabase
        .from('lancamentos_contabeis')
        .update({ status: 'APROVADO' })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return res.status(200).json({
        sucesso: true,
        lancamento: data
      });
    } catch (error) {
      console.error('Erro ao aprovar lançamento:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao aprovar lançamento'
      });
    }
  },
  
  rejeitarLancamento: async (req, res) => {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      
      if (!motivo) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Motivo da rejeição é obrigatório'
        });
      }
      
      // Verificar se o lançamento existe
      const { data: lancamento, error: checkError } = await supabase
        .from('lancamentos_contabeis')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!lancamento) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Lançamento não encontrado'
        });
      }
      
      if (lancamento.status !== 'PENDENTE') {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Apenas lançamentos pendentes podem ser rejeitados'
        });
      }
      
      // Rejeitar lançamento
      const { data, error } = await supabase
        .from('lancamentos_contabeis')
        .update({ 
          status: 'REJEITADO',
          historico: `${lancamento.historico} [REJEITADO: ${motivo}]`
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return res.status(200).json({
        sucesso: true,
        lancamento: data
      });
    } catch (error) {
      console.error('Erro ao rejeitar lançamento:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao rejeitar lançamento'
      });
    }
  }
};

module.exports = contabilController;
