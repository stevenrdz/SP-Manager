import { format } from 'sql-formatter';

export class SqlCleaner {
  static clean(sql: string): string {
    if (!sql) return '';

    // 1. Remove comments
    // Remove Multi-line comments /* ... */
    let cleanSql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove Single-line comments -- ... (be careful not to remove urls or dashes in strings if possible, 
    // but verifying context is hard with regex. A safe bet for SPs is standard --)
    cleanSql = cleanSql.replace(/--.*$/gm, '');

    // 2. Format SQL using sql-formatter for T-SQL (Transact-SQL)
    try {
      cleanSql = format(cleanSql, {
        language: 'tsql',
        keywordCase: 'upper',
        linesBetweenQueries: 2,
      });
    } catch (e) {
      console.warn('SQL Formatting failed, returning cleaned but unformatted SQL', e);
      // Fallback to just regex-cleaned
    }

    return cleanSql.trim();
  }
}
