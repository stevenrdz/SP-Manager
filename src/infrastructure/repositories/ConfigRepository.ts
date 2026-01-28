import { ConfigModel } from '../database/schemas/ConfigSchema';
import { AppConfig, DatabaseConfig, OpenAIConfig } from '@/domain/models/Config';
import { IConfigRepository } from '@/domain/repositories';

export class ConfigRepository implements IConfigRepository {
  /**
   * Get the current application configuration
   */
  async getConfig(): Promise<AppConfig | null> {
    try {
      const config = await ConfigModel.findById('app-config');
      return config ? config.toObject() : null;
    } catch (error) {
      console.error('[ConfigRepository] Error getting config:', error);
      return null;
    }
  }

  /**
   * Update database configuration
   */
  async updateDatabaseConfig(dbConfig: DatabaseConfig): Promise<void> {
    try {
      await ConfigModel.findByIdAndUpdate(
        'app-config',
        {
          $set: {
            database: dbConfig,
            updatedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('[ConfigRepository] Error updating database config:', error);
      throw error;
    }
  }

  /**
   * Update OpenAI configuration
   */
  async updateOpenAIConfig(aiConfig: OpenAIConfig): Promise<void> {
    try {
      await ConfigModel.findByIdAndUpdate(
        'app-config',
        {
          $set: {
            openai: aiConfig,
            updatedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('[ConfigRepository] Error updating OpenAI config:', error);
      throw error;
    }
  }

  /**
   * Delete all configuration (for testing/reset)
   */
  async deleteConfig(): Promise<void> {
    try {
      await ConfigModel.findByIdAndDelete('app-config');
    } catch (error) {
      console.error('[ConfigRepository] Error deleting config:', error);
      throw error;
    }
  }
}
