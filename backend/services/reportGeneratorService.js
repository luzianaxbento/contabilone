// Serviço de gerador de relatórios dinâmicos para Supabase
const supabase = require('../config/supabase');

/**
 * Serviço para geração de relatórios dinâmicos
 * Permite consultas flexíveis a qualquer tabela do banco de dados
 * com suporte a filtros, agrupamentos, ordenação e agregações
 */
class ReportGeneratorService {
  /**
   * Obtém a lista de tabelas disponíveis para relatórios
   * @returns {Promise<Array>} Lista de tabelas disponíveis
   */
  async getAvailableTables() {
    try {
      // Consultar metadados do PostgreSQL para obter tabelas
      const { data, error } = await supabase.rpc('get_available_tables');
      
      if (error) throw error;
      
      // Filtrar tabelas do sistema e retornar apenas tabelas de negócio
      const businessTables = data.filter(table => 
        !table.table_name.startsWith('_') && 
        !['auth', 'storage'].includes(table.schema_name)
      );
      
      return businessTables;
    } catch (error) {
      console.error('Erro ao obter tabelas disponíveis:', error);
      throw new Error('Não foi possível obter a lista de tabelas disponíveis');
    }
  }
  
  /**
   * Obtém os campos de uma tabela específica
   * @param {string} tableName Nome da tabela
   * @returns {Promise<Array>} Lista de campos da tabela
   */
  async getTableFields(tableName) {
    try {
      // Consultar metadados do PostgreSQL para obter campos da tabela
      const { data, error } = await supabase.rpc('get_table_fields', {
        p_table_name: tableName
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error(`Erro ao obter campos da tabela ${tableName}:`, error);
      throw new Error(`Não foi possível obter os campos da tabela ${tableName}`);
    }
  }
  
  /**
   * Gera um relatório dinâmico com base nos parâmetros fornecidos
   * @param {Object} reportConfig Configuração do relatório
   * @returns {Promise<Object>} Dados do relatório gerado
   */
  async generateReport(reportConfig) {
    try {
      const {
        tables,
        fields,
        joins,
        filters,
        groupBy,
        orderBy,
        limit,
        offset
      } = reportConfig;
      
      // Validar configuração do relatório
      if (!tables || !tables.length) {
        throw new Error('Pelo menos uma tabela deve ser especificada');
      }
      
      if (!fields || !fields.length) {
        throw new Error('Pelo menos um campo deve ser selecionado');
      }
      
      // Construir consulta SQL dinâmica
      let query = this._buildDynamicQuery(
        tables,
        fields,
        joins,
        filters,
        groupBy,
        orderBy,
        limit,
        offset
      );
      
      // Executar consulta via RPC para maior segurança
      const { data, error, count } = await supabase.rpc('execute_dynamic_query', {
        p_query: query.sql,
        p_params: query.params
      });
      
      if (error) throw error;
      
      // Obter contagem total para paginação
      const { data: totalCount, error: countError } = await supabase.rpc('count_dynamic_query', {
        p_query: query.countSql,
        p_params: query.params
      });
      
      if (countError) throw countError;
      
      return {
        data,
        metadata: {
          total: totalCount,
          page: Math.floor(offset / limit) + 1,
          pageSize: limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw new Error(`Não foi possível gerar o relatório: ${error.message}`);
    }
  }
  
  /**
   * Salva uma configuração de relatório para uso futuro
   * @param {Object} reportConfig Configuração do relatório
   * @param {string} userId ID do usuário
   * @param {string} name Nome do relatório
   * @param {string} description Descrição do relatório
   * @returns {Promise<Object>} Relatório salvo
   */
  async saveReportConfig(reportConfig, userId, name, description) {
    try {
      const { data, error } = await supabase
        .from('report_configurations')
        .insert([{
          user_id: userId,
          name,
          description,
          config: reportConfig,
          created_at: new Date().toISOString()
        }])
        .select();
      
      if (error) throw error;
      
      return data[0];
    } catch (error) {
      console.error('Erro ao salvar configuração de relatório:', error);
      throw new Error('Não foi possível salvar a configuração do relatório');
    }
  }
  
  /**
   * Obtém relatórios salvos pelo usuário
   * @param {string} userId ID do usuário
   * @returns {Promise<Array>} Lista de relatórios salvos
   */
  async getSavedReports(userId) {
    try {
      const { data, error } = await supabase
        .from('report_configurations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Erro ao obter relatórios salvos:', error);
      throw new Error('Não foi possível obter os relatórios salvos');
    }
  }
  
  /**
   * Constrói uma consulta SQL dinâmica com base nos parâmetros
   * @private
   */
  _buildDynamicQuery(tables, fields, joins, filters, groupBy, orderBy, limit, offset) {
    // Implementação simplificada para demonstração
    // Em um ambiente real, seria necessário implementar um construtor SQL mais robusto
    
    const mainTable = tables[0];
    const fieldsList = fields.map(f => `${f.table}.${f.field} as "${f.alias || f.field}"`).join(', ');
    
    let sql = `SELECT ${fieldsList} FROM ${mainTable}`;
    
    // Adicionar joins
    if (joins && joins.length) {
      joins.forEach(join => {
        sql += ` ${join.type || 'LEFT'} JOIN ${join.table} ON ${join.condition}`;
      });
    }
    
    // Adicionar filtros
    const params = [];
    if (filters && filters.length) {
      sql += ' WHERE ';
      const filterConditions = filters.map((filter, index) => {
        params.push(filter.value);
        return `${filter.table}.${filter.field} ${filter.operator} $${index + 1}`;
      });
      sql += filterConditions.join(' AND ');
    }
    
    // Adicionar agrupamento
    if (groupBy && groupBy.length) {
      const groupFields = groupBy.map(g => `${g.table}.${g.field}`).join(', ');
      sql += ` GROUP BY ${groupFields}`;
    }
    
    // Adicionar ordenação
    if (orderBy && orderBy.length) {
      const orderFields = orderBy.map(o => `${o.table}.${o.field} ${o.direction || 'ASC'}`).join(', ');
      sql += ` ORDER BY ${orderFields}`;
    }
    
    // Adicionar limite e offset para paginação
    sql += ` LIMIT ${limit || 100} OFFSET ${offset || 0}`;
    
    // Construir consulta de contagem para paginação
    let countSql = `SELECT COUNT(*) FROM ${mainTable}`;
    
    // Adicionar joins para contagem
    if (joins && joins.length) {
      joins.forEach(join => {
        countSql += ` ${join.type || 'LEFT'} JOIN ${join.table} ON ${join.condition}`;
      });
    }
    
    // Adicionar filtros para contagem
    if (filters && filters.length) {
      countSql += ' WHERE ';
      const filterConditions = filters.map((filter, index) => {
        return `${filter.table}.${filter.field} ${filter.operator} $${index + 1}`;
      });
      countSql += filterConditions.join(' AND ');
    }
    
    return {
      sql,
      countSql,
      params
    };
  }
}

module.exports = new ReportGeneratorService();
