import * as sql from 'mssql';
import { ConfigService } from '@/application/services/ConfigService';

let pool: sql.ConnectionPool | null = null;
let configService: ConfigService | null = null;

/**
 * Get or create ConfigService instance
 */
export const getConfigService = (): ConfigService => {
  if (!configService) {
    configService = new ConfigService();
  }
  return configService;
};

/**
 * Get SQL configuration from ConfigService or fallback to environment variables
 */
export const getSqlConfig = async (): Promise<sql.config> => {
  try {
    const service = getConfigService();
    const dbConfig = await service.getDatabaseConfig();
    
    return {
      user: dbConfig.user,
      password: dbConfig.password,
      server: dbConfig.server,
      database: dbConfig.database,
      port: dbConfig.port || 1433,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    };
  } catch (error) {
    console.error('[SQL] Error getting config from service, using env fallback:', error);
    // Fallback to environment variables
    return {
      user: process.env.SQL_USER || process.env.SQL_SERVER_USER,
      password: process.env.SQL_PASSWORD || process.env.SQL_SERVER_PASSWORD,
      server: process.env.SQL_HOST || process.env.SQL_SERVER_HOST || 'localhost',
      database: process.env.SQL_DB || process.env.SQL_SERVER_DATABASE,
      port: parseInt(process.env.SQL_PORT || process.env.SQL_SERVER_PORT || '1433'),
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    };
  }
};

/**
 * Get SQL connection pool (with dynamic configuration)
 */
export const getSqlPool = async (): Promise<sql.ConnectionPool> => {
  if (pool && pool.connected) {
    return pool;
  }
  
  try {
    const config = await getSqlConfig();
    pool = await new sql.ConnectionPool(config).connect();
    console.log('[SQL] Connected to database:', config.database);
    return pool;
  } catch (err) {
    console.error('[SQL] Connection Failed:', err);
    throw err;
  }
};

/**
 * Refresh SQL connection (useful after config changes)
 */
export const refreshSqlConnection = async (): Promise<void> => {
  if (pool) {
    try {
      await pool.close();
    } catch (error) {
      console.error('[SQL] Error closing pool:', error);
    }
    pool = null;
  }
  
  // Invalidate config cache
  const service = getConfigService();
  service.invalidateCache();
  
  // Reconnect
  await getSqlPool();
};
