import { ConfigModel } from '../database/schemas/ConfigSchema';
import { AppConfig, DatabaseConfig, OpenAIConfig } from '@/domain/models/Config';
import { encryption } from '@/lib/encryption';
import dbConnect from '../dbConnect';

export class ConfigRepository {
  /**
   * Get the current application configuration
   */
  async getConfig(): Promise<AppConfig | null> {
    try {
      await dbConnect();
      const config = await ConfigModel.findById('app-config');
      if (!config) return null;

      const obj = config.toObject();
      
      // Decrypt sensitive fields
      if (obj.database?.password) {
        obj.database.password = encryption.decrypt(obj.database.password);
      }
      if (obj.openai?.apiKey) {
        obj.openai.apiKey = encryption.decrypt(obj.openai.apiKey);
      }

      return obj;
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
      await dbConnect();
      await ConfigModel.findByIdAndUpdate(
        'app-config',
        {
          $set: {
            database: {
              ...dbConfig,
              // Encrypt password if present
              password: dbConfig.password ? encryption.encrypt(dbConfig.password) : undefined
            },
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
      await dbConnect();
      await ConfigModel.findByIdAndUpdate(
        'app-config',
        {
          $set: {
            openai: {
              ...aiConfig,
              // Encrypt API Key if present
              apiKey: aiConfig.apiKey ? encryption.encrypt(aiConfig.apiKey) : undefined
            },
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
      await dbConnect();
      await ConfigModel.findByIdAndDelete('app-config');
    } catch (error) {
      console.error('[ConfigRepository] Error deleting config:', error);
      throw error;
    }
  }
}
