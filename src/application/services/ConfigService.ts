import { IConfigRepository } from '@/domain/repositories';
import { ConfigRepository } from '@/infrastructure/repositories/ConfigRepository';
import { AppConfig, DatabaseConfig, OpenAIConfig } from '@/domain/models/Config';
import * as sql from 'mssql';

export class ConfigService {
  private repository: IConfigRepository;
  private cachedConfig: AppConfig | null = null;
  private cacheTimestamp: number = 0;
  private CACHE_TTL = 60000; // 1 minute cache

  constructor(repository?: IConfigRepository) {
    this.repository = repository || new ConfigRepository();
  }

  /**
   * Get configuration with caching
   */
  async getConfig(): Promise<AppConfig> {
    const now = Date.now();
    
    // Return cached config if still valid
    if (this.cachedConfig && (now - this.cacheTimestamp) < this.CACHE_TTL) {
      return this.cachedConfig;
    }

    // Fetch from database
    const config = await this.repository.getConfig();
    
    // Build config with fallback to environment variables
    const finalConfig: AppConfig = {
      database: config?.database || this.getDefaultDatabaseConfig(),
      openai: config?.openai || this.getDefaultOpenAIConfig(),
    };

    // Update cache
    this.cachedConfig = finalConfig;
    this.cacheTimestamp = now;

    return finalConfig;
  }

  /**
   * Get database configuration (with fallback to .env)
   */
  async getDatabaseConfig(): Promise<DatabaseConfig> {
    const config = await this.getConfig();
    return config.database!;
  }

  /**
   * Get OpenAI configuration (with fallback to .env)
   */
  async getOpenAIConfig(): Promise<OpenAIConfig> {
    const config = await this.getConfig();
    return config.openai!;
  }

  /**
   * Save database configuration
   */
  async saveDatabaseConfig(dbConfig: DatabaseConfig): Promise<void> {
    await this.repository.updateDatabaseConfig(dbConfig);
    this.invalidateCache();
  }

  /**
   * Save OpenAI configuration
   */
  async saveOpenAIConfig(aiConfig: OpenAIConfig): Promise<void> {
    await this.repository.updateOpenAIConfig(aiConfig);
    this.invalidateCache();
  }

  /**
   * Test database connection
   */
  async testDatabaseConnection(dbConfig: DatabaseConfig): Promise<{ success: boolean; message: string }> {
    try {
      const config: sql.config = {
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

      const pool = await new sql.ConnectionPool(config).connect();
      await pool.close();

      return {
        success: true,
        message: 'Conexión exitosa a la base de datos',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Error al conectar: ${error.message}`,
      };
    }
  }

  /**
   * Invalidate cache (call after updates)
   */
  invalidateCache(): void {
    this.cachedConfig = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Get default database config from environment variables
   */
  private getDefaultDatabaseConfig(): DatabaseConfig {
    return {
      type: 'sqlserver',
      server: process.env.SQL_HOST || process.env.SQL_SERVER_HOST || 'localhost',
      user: process.env.SQL_USER || process.env.SQL_SERVER_USER || 'sa',
      password: process.env.SQL_PASSWORD || process.env.SQL_SERVER_PASSWORD || '',
      database: process.env.SQL_DB || process.env.SQL_SERVER_DATABASE || 'master',
      port: parseInt(process.env.SQL_PORT || process.env.SQL_SERVER_PORT || '1433'),
    };
  }

  /**
   * Get default OpenAI config from environment variables
   */
  private getDefaultOpenAIConfig(): OpenAIConfig {
    return {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    };
  }
}
