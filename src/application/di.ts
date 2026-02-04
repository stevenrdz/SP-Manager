import { SqlServerRepository } from "@/infrastructure/repositories/SqlServerRepository";
import { MongoMetadataRepository } from "@/infrastructure/repositories/MongoMetadataRepository";
import { StoredProcedureService } from "@/application/services/StoredProcedureService";
import { BackupService } from "@/application/services/BackupService";
import { OpenAIService } from "@/infrastructure/services/OpenAIService";
import { ConfigService } from "@/application/services/ConfigService";

// Singleton instances
// Singleton instances holder
let sqlRepo: SqlServerRepository | null = null;
let metaRepo: MongoMetadataRepository | null = null;
let configService: ConfigService | null = null;
let openAIService: OpenAIService | null = null;
let spService: StoredProcedureService | null = null;
let backupService: BackupService | null = null;

const getSqlRepo = () => {
    if (!sqlRepo) sqlRepo = new SqlServerRepository();
    return sqlRepo;
}

const getMetaRepo = () => {
    if (!metaRepo) metaRepo = new MongoMetadataRepository();
    return metaRepo;
}

export const getConfigService = () => {
    if (!configService) configService = new ConfigService();
    return configService;
};

export const getOpenAIService = () => {
    if (!openAIService) openAIService = new OpenAIService();
    return openAIService;
};

export const getSpService = () => {
    if (!spService) {
        spService = new StoredProcedureService(getSqlRepo(), getMetaRepo(), getOpenAIService());
    }
    return spService;
};

export const getBackupService = () => {
    if (!backupService) {
        backupService = new BackupService(getMetaRepo());
    }
    return backupService;
};
