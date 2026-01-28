import { SqlServerRepository } from "@/infrastructure/repositories/SqlServerRepository";
import { MongoMetadataRepository } from "@/infrastructure/repositories/MongoMetadataRepository";
import { MockSqlServerRepository } from "@/infrastructure/repositories/MockSqlServerRepository";
import { MockMetadataRepository } from "@/infrastructure/repositories/MockMetadataRepository";
import { MockConfigRepository } from "@/infrastructure/repositories/MockConfigRepository";
import { StoredProcedureService } from "@/application/services/StoredProcedureService";
import { BackupService } from "@/application/services/BackupService";
import { OpenAIService } from "@/infrastructure/services/OpenAIService";
import { ConfigService } from "@/application/services/ConfigService";

// Check if we're in demo mode
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Singleton instances - use mock repositories in demo mode
const sqlRepo = isDemoMode ? new MockSqlServerRepository() : new SqlServerRepository();
const metaRepo = isDemoMode ? new MockMetadataRepository() : new MongoMetadataRepository();
const configRepo = isDemoMode ? new MockConfigRepository() : undefined;
const configService = new ConfigService(configRepo);
const openAIService = new OpenAIService();

const spService = new StoredProcedureService(sqlRepo, metaRepo, openAIService);
const backupService = new BackupService(metaRepo);

export const getSpService = () => spService;
export const getBackupService = () => backupService;
export const getConfigService = () => configService;
export const getOpenAIService = () => openAIService;
export const isDemoModeEnabled = () => isDemoMode;
