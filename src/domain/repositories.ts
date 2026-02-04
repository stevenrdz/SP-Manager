import { SPMetadata, StoredProcedureCore, StoredProcedureDefinition, TableData } from "./entities";

export interface ISqlRepository {
  listDatabases(): Promise<string[]>;
  listStoredProcedures(database: string, search?: string): Promise<StoredProcedureCore[]>;
  getStoredProcedureDefinition(database: string, schema: string, name: string): Promise<StoredProcedureDefinition | null>;
  getTableData(database: string, schema: string, name: string): Promise<TableData | null>;
}

export interface IMetadataRepository {
  getMetadata(database: string, schema: string, spName: string): Promise<SPMetadata | null>;
  saveMetadata(metadata: SPMetadata): Promise<void>;
  listMetadata(database: string): Promise<SPMetadata[]>;
  searchAllMetadata(query: string): Promise<SPMetadata[]>;
  searchByCode(query: string): Promise<SPMetadata[]>;
  findAllMetadata(): Promise<SPMetadata[]>;
  getAllProjects(): Promise<string[]>;
  getSpsByProject(projectName: string): Promise<SPMetadata[]>;
  getStatistics(): Promise<{
    totalSPs: number;
    totalByDatabase: { database: string; count: number }[];
    documented: number;
    undocumented: number;
    topProjects: { project: string; count: number }[];
  }>;
}
