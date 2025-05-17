// Arquivo de integração entre frontend e backend
// Este arquivo contém exemplos de uso da API e fluxos de integração

import api, { 
  authService, 
  contabilService, 
  fiscalService, 
  folhaService, 
  patrimonioService, 
  societarioService 
} from './api';

// Exemplo de fluxo de autenticação
export const fluxoAutenticacao = async (email, senha) => {
  try {
    // 1. Realizar login
    const loginResponse = await authService.login(email, senha);
    
    if (!loginResponse.sucesso) {
      throw new Error(loginResponse.mensagem || 'Falha na autenticação');
    }
    
    // 2. Armazenar token e dados do usuário
    const { token, usuario } = loginResponse;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(usuario));
    
    // 3. Obter perfil completo do usuário
    const perfilResponse = await authService.obterPerfil();
    
    // 4. Retornar dados do usuário autenticado
    return {
      sucesso: true,
      usuario: perfilResponse.usuario
    };
  } catch (error) {
    console.error('Erro no fluxo de autenticação:', error);
    
    // Limpar dados de autenticação em caso de erro
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return {
      sucesso: false,
      mensagem: error.message || 'Erro no processo de autenticação'
    };
  }
};

// Exemplo de fluxo de lançamento contábil
export const fluxoLancamentoContabil = async (dadosLancamento) => {
  try {
    // 1. Validar dados do lançamento
    if (!dadosLancamento.partidas || dadosLancamento.partidas.length < 2) {
      throw new Error('Um lançamento deve ter pelo menos duas partidas');
    }
    
    // Verificar se o total de débitos é igual ao total de créditos
    let totalDebitos = 0;
    let totalCreditos = 0;
    
    dadosLancamento.partidas.forEach(partida => {
      if (partida.tipo === 'DEBITO') {
        totalDebitos += parseFloat(partida.valor);
      } else if (partida.tipo === 'CREDITO') {
        totalCreditos += parseFloat(partida.valor);
      }
    });
    
    if (Math.abs(totalDebitos - totalCreditos) > 0.01) {
      throw new Error('O total de débitos deve ser igual ao total de créditos');
    }
    
    // 2. Criar lançamento contábil
    const lancamentoResponse = await contabilService.criarLancamento(dadosLancamento);
    
    if (!lancamentoResponse.sucesso) {
      throw new Error(lancamentoResponse.mensagem || 'Falha ao criar lançamento');
    }
    
    // 3. Obter detalhes do lançamento criado
    const { lancamento } = lancamentoResponse;
    const detalhesResponse = await contabilService.obterLancamentoPorId(lancamento.id);
    
    // 4. Retornar detalhes do lançamento
    return {
      sucesso: true,
      lancamento: detalhesResponse.lancamento
    };
  } catch (error) {
    console.error('Erro no fluxo de lançamento contábil:', error);
    
    return {
      sucesso: false,
      mensagem: error.message || 'Erro no processo de lançamento contábil'
    };
  }
};

// Exemplo de fluxo de importação de documento fiscal
export const fluxoImportacaoDocumentoFiscal = async (xmlContent) => {
  try {
    // 1. Enviar XML para processamento
    const importacaoResponse = await fiscalService.importarXML(xmlContent);
    
    if (!importacaoResponse.sucesso) {
      throw new Error(importacaoResponse.mensagem || 'Falha ao importar XML');
    }
    
    // 2. Obter detalhes do documento importado
    const { documento } = importacaoResponse;
    const detalhesResponse = await fiscalService.obterDocumentoPorId(documento.id);
    
    // 3. Gerar lançamento contábil automaticamente
    const lancamentoResponse = await contabilService.criarLancamento({
      numero_lancamento: `DOC${documento.numero}`,
      data_lancamento: new Date().toISOString().split('T')[0],
      data_competencia: documento.data_emissao,
      tipo_lancamento: 'NORMAL',
      historico: `Lançamento automático - ${documento.tipo_documento} ${documento.numero}`,
      valor: documento.valor_total,
      origem: documento.tipo_documento,
      origem_id: documento.id,
      partidas: [
        {
          conta_id: 1, // ID da conta de estoque ou despesa
          tipo: 'DEBITO',
          valor: documento.valor_total
        },
        {
          conta_id: 2, // ID da conta de fornecedores
          tipo: 'CREDITO',
          valor: documento.valor_total
        }
      ]
    });
    
    // 4. Retornar detalhes do documento e lançamento
    return {
      sucesso: true,
      documento: detalhesResponse.documento,
      lancamento: lancamentoResponse.sucesso ? lancamentoResponse.lancamento : null
    };
  } catch (error) {
    console.error('Erro no fluxo de importação de documento fiscal:', error);
    
    return {
      sucesso: false,
      mensagem: error.message || 'Erro no processo de importação de documento fiscal'
    };
  }
};

// Exemplo de fluxo de cálculo de folha de pagamento
export const fluxoCalculoFolhaPagamento = async (competencia, funcionarios) => {
  try {
    // 1. Iniciar cálculo da folha
    const inicioResponse = await folhaService.iniciarCalculoFolha(competencia);
    
    if (!inicioResponse.sucesso) {
      throw new Error(inicioResponse.mensagem || 'Falha ao iniciar cálculo da folha');
    }
    
    // 2. Calcular folha para cada funcionário
    const { folha } = inicioResponse;
    const resultadosCalculos = [];
    
    for (const funcionario of funcionarios) {
      const calculoResponse = await folhaService.calcularFolhaFuncionario(folha.id, funcionario.id);
      
      if (calculoResponse.sucesso) {
        resultadosCalculos.push(calculoResponse.calculo);
      }
    }
    
    // 3. Finalizar cálculo da folha
    const finalizacaoResponse = await folhaService.finalizarCalculoFolha(folha.id);
    
    // 4. Gerar lançamento contábil da folha
    const lancamentoResponse = await contabilService.criarLancamento({
      numero_lancamento: `FOLHA${competencia.replace(/\D/g, '')}`,
      data_lancamento: new Date().toISOString().split('T')[0],
      data_competencia: `${competencia}-01`,
      tipo_lancamento: 'NORMAL',
      historico: `Folha de pagamento - ${competencia}`,
      valor: finalizacaoResponse.folha.valor_total,
      origem: 'FOLHA',
      origem_id: folha.id,
      partidas: [
        {
          conta_id: 3, // ID da conta de despesa com pessoal
          tipo: 'DEBITO',
          valor: finalizacaoResponse.folha.valor_total
        },
        {
          conta_id: 4, // ID da conta de salários a pagar
          tipo: 'CREDITO',
          valor: finalizacaoResponse.folha.valor_total
        }
      ]
    });
    
    // 5. Retornar detalhes da folha e lançamento
    return {
      sucesso: true,
      folha: finalizacaoResponse.folha,
      calculos: resultadosCalculos,
      lancamento: lancamentoResponse.sucesso ? lancamentoResponse.lancamento : null
    };
  } catch (error) {
    console.error('Erro no fluxo de cálculo de folha de pagamento:', error);
    
    return {
      sucesso: false,
      mensagem: error.message || 'Erro no processo de cálculo de folha de pagamento'
    };
  }
};

// Exemplo de fluxo de cálculo de depreciação
export const fluxoCalculoDepreciacao = async (competencia) => {
  try {
    // 1. Obter ativos depreciáveis
    const ativosResponse = await patrimonioService.listarAtivos({ depreciavel: true });
    
    if (!ativosResponse.sucesso) {
      throw new Error(ativosResponse.mensagem || 'Falha ao obter ativos');
    }
    
    // 2. Calcular depreciação para o período
    const calculoResponse = await patrimonioService.calcularDepreciacao(competencia, ativosResponse.ativos);
    
    if (!calculoResponse.sucesso) {
      throw new Error(calculoResponse.mensagem || 'Falha ao calcular depreciação');
    }
    
    // 3. Gerar lançamento contábil da depreciação
    const lancamentoResponse = await contabilService.criarLancamento({
      numero_lancamento: `DEP${competencia.replace(/\D/g, '')}`,
      data_lancamento: new Date().toISOString().split('T')[0],
      data_competencia: `${competencia}-01`,
      tipo_lancamento: 'NORMAL',
      historico: `Depreciação - ${competencia}`,
      valor: calculoResponse.valor_total,
      origem: 'DEPRECIACAO',
      origem_id: calculoResponse.id,
      partidas: [
        {
          conta_id: 5, // ID da conta de despesa com depreciação
          tipo: 'DEBITO',
          valor: calculoResponse.valor_total
        },
        {
          conta_id: 6, // ID da conta de depreciação acumulada
          tipo: 'CREDITO',
          valor: calculoResponse.valor_total
        }
      ]
    });
    
    // 4. Retornar detalhes da depreciação e lançamento
    return {
      sucesso: true,
      depreciacao: calculoResponse,
      lancamento: lancamentoResponse.sucesso ? lancamentoResponse.lancamento : null
    };
  } catch (error) {
    console.error('Erro no fluxo de cálculo de depreciação:', error);
    
    return {
      sucesso: false,
      mensagem: error.message || 'Erro no processo de cálculo de depreciação'
    };
  }
};

// Exemplo de fluxo de distribuição de lucros
export const fluxoDistribuicaoLucros = async (valor, data) => {
  try {
    // 1. Obter sócios ativos
    const sociosResponse = await societarioService.listarSocios({ status: 'ATIVO' });
    
    if (!sociosResponse.sucesso) {
      throw new Error(sociosResponse.mensagem || 'Falha ao obter sócios');
    }
    
    // 2. Calcular distribuição proporcional
    const distribuicaoResponse = await societarioService.calcularDistribuicao(valor, sociosResponse.socios);
    
    if (!distribuicaoResponse.sucesso) {
      throw new Error(distribuicaoResponse.mensagem || 'Falha ao calcular distribuição');
    }
    
    // 3. Registrar distribuição
    const registroResponse = await societarioService.registrarDistribuicao({
      data,
      valor,
      distribuicoes: distribuicaoResponse.distribuicoes
    });
    
    // 4. Gerar lançamento contábil da distribuição
    const lancamentoResponse = await contabilService.criarLancamento({
      numero_lancamento: `DIST${data.replace(/\D/g, '')}`,
      data_lancamento: data,
      data_competencia: data.substring(0, 7),
      tipo_lancamento: 'NORMAL',
      historico: `Distribuição de lucros - ${data}`,
      valor,
      origem: 'DISTRIBUICAO',
      origem_id: registroResponse.distribuicao.id,
      partidas: [
        {
          conta_id: 7, // ID da conta de lucros acumulados
          tipo: 'DEBITO',
          valor
        },
        {
          conta_id: 8, // ID da conta de lucros a distribuir
          tipo: 'CREDITO',
          valor
        }
      ]
    });
    
    // 5. Retornar detalhes da distribuição e lançamento
    return {
      sucesso: true,
      distribuicao: registroResponse.distribuicao,
      lancamento: lancamentoResponse.sucesso ? lancamentoResponse.lancamento : null
    };
  } catch (error) {
    console.error('Erro no fluxo de distribuição de lucros:', error);
    
    return {
      sucesso: false,
      mensagem: error.message || 'Erro no processo de distribuição de lucros'
    };
  }
};

// Exportar todos os fluxos de integração
export default {
  fluxoAutenticacao,
  fluxoLancamentoContabil,
  fluxoImportacaoDocumentoFiscal,
  fluxoCalculoFolhaPagamento,
  fluxoCalculoDepreciacao,
  fluxoDistribuicaoLucros
};
