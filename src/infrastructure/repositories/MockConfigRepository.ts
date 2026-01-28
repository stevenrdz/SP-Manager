import { IConfigRepository } from '@/domain/repositories';
import { AppConfig, DatabaseConfig, OpenAIConfig } from '@/domain/models/Config';

export class MockConfigRepository implements IConfigRepository {
  private config: AppConfig = {
    database: {
      type: 'sqlserver',
      server: 'demo.example.com',
      port: 1433,
      user: 'demo_user',
      password: '***DEMO***',
      database: 'master',
    },
    openai: {
      apiKey: '***DEMO***',
      model: 'gpt-4o-mini',
    },
  };

  async getConfig(): Promise<AppConfig | null> {
    return this.config;
  }

  async updateDatabaseConfig(dbConfig: DatabaseConfig): Promise<void> {
    // In demo mode, don't actually save, just update local memory
    this.config.database = dbConfig;
    console.log('[DEMO MODE] Database config updated in memory');
  }

  async updateOpenAIConfig(aiConfig: OpenAIConfig): Promise<void> {
    // In demo mode, don't actually save, just update local memory
    this.config.openai = aiConfig;
    console.log('[DEMO MODE] OpenAI config updated in memory');
  }
}
