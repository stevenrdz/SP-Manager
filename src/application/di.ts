import { SqlServerRepository } from "@/infrastructure/repositories/SqlServerRepository";
import { MongoMetadataRepository } from "@/infrastructure/repositories/MongoMetadataRepository";
import { StoredProcedureService } from "@/application/services/StoredProcedureService";
import { BackupService } from "@/application/services/BackupService";
import { OpenAIService } from "@/infrastructure/services/OpenAIService";
import { ConfigService } from "@/application/services/ConfigService";

// Singleton instances
const sqlRepo = new SqlServerRepository();
const metaRepo = new MongoMetadataRepository();
const configService = new ConfigService();
const openAIService = new OpenAIService();

const spService = new StoredProcedureService(sqlRepo, metaRepo, openAIService);
const backupService = new BackupService(metaRepo);

export const getSpService = () => spService;
export const getBackupService = () => backupService;
export const getConfigService = () => configService;
export const getOpenAIService = () => openAIService;
