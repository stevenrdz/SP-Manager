// Domain model for application configuration

export interface DatabaseConfig {
  type: 'sqlserver' | 'postgresql' | 'mysql' | 'oracle'; // Tipo de base de datos
  server: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}

export interface OpenAIConfig {
  apiKey: string;
  model: string;
}

export interface AppConfig {
  _id?: string;
  database?: DatabaseConfig;
  openai?: OpenAIConfig;
  updatedAt?: Date;
}
