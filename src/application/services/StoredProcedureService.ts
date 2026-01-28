import { IMetadataRepository, ISqlRepository } from "@/domain/repositories";
import { SPMetadata, StoredProcedureDefinition } from "@/domain/entities";

import { OpenAIService } from "@/infrastructure/services/OpenAIService";

export class StoredProcedureService {
  constructor(
    private sqlRepo: ISqlRepository,
    private metaRepo: IMetadataRepository,
    private openAIService: OpenAIService
  ) {}

  async analyzeStoredProcedure(database: string, schema: string, name: string, apiKey?: string): Promise<SPMetadata | null> {
    const definition = await this.sqlRepo.getStoredProcedureDefinition(database, schema, name);
    if (!definition || !definition.definition) return null;

    const summary = await this.openAIService.generateSummary(name, definition.definition, apiKey);
    
    // Update metadata with AI summary
    const metadata = await this.metaRepo.getMetadata(database, schema, name) || this.extractMetadataFromDefinition(definition);
    if (summary) {
        metadata.description = summary; // Or a specific field like 'aiSummary'
        await this.metaRepo.saveMetadata(metadata);
    }
    return metadata;
  }

  async listDatabases(): Promise<string[]> {
    return this.sqlRepo.listDatabases();
  }

  async getAllProjects(): Promise<string[]> {
    return this.metaRepo.getAllProjects();
  }

  async getSpsByProject(projectName: string): Promise<SPMetadata[]> {
    return this.metaRepo.getSpsByProject(projectName);
  }

  async getStatistics() {
    return this.metaRepo.getStatistics();
  }

  async searchStoredProcedures(database: string | undefined, search?: string, source: 'mongo' | 'sql' = 'mongo') {
    if (!database) {
      if (search) {
        const metadataList = await this.metaRepo.searchAllMetadata(search);
        // Map to Core structure
        return metadataList.map(m => ({
          name: m.spName,
          schema: m.schema,
          database: m.database,
          objectId: 0, 
          createDate: m.lastScanDate,
          modifyDate: m.lastScanDate
        }));
      }
      return [];
    }

    if (source === 'mongo') {
      const metadataList = await this.metaRepo.listMetadata(database);
      
      // Map to Core structure
      let results = metadataList.map(m => ({
        name: m.spName,
        schema: m.schema,
        database: m.database,
        objectId: 0, // Placeholder, UI should prefer key based on name
        createDate: m.lastScanDate,
        modifyDate: m.lastScanDate
      }));

      if (search) {
        const lowerSearch = search.toLowerCase();
        results = results.filter(r => 
          r.name.toLowerCase().includes(lowerSearch) || 
          r.schema.toLowerCase().includes(lowerSearch)
        );
      }
      return results;
    }

    return this.sqlRepo.listStoredProcedures(database, search);
  }

  async getProcedureDetails(database: string, schema: string, name: string) {
    console.log(`[SERVICE] ========== getProcedureDetails Called ==========`);
    console.log(`[SERVICE] Parameters: database="${database}", schema="${schema}", name="${name}"`);
    
    console.log('[SERVICE] Calling sqlRepo.getStoredProcedureDefinition...');
    const definition = await this.sqlRepo.getStoredProcedureDefinition(database, schema, name);
    console.log('[SERVICE] Definition result:', definition ? 'FOUND' : 'NULL');
    
    if (!definition) {
      console.error(`[SERVICE] ❌ No definition found for ${database}.${schema}.${name}`);
      return null;
    }

    console.log('[SERVICE] Fetching metadata from Mongo...');
    const metadata = await this.metaRepo.getMetadata(database, schema, name);
    console.log('[SERVICE] Metadata result:', metadata ? 'FOUND' : 'NULL (will extract from definition)');
    
    // If no metadata exists, we can try to generate it on the fly or just return partial
    // But scanDatabase should ideally be run first or lazily here.
    const effectiveMetadata = metadata || this.extractMetadataFromDefinition(definition);

    console.log('[SERVICE] ✅ Returning complete SP details');
    return {
      ...definition,
      metadata: effectiveMetadata
    };
  }

  async updateMetadata(metadata: SPMetadata): Promise<void> {
    return this.metaRepo.saveMetadata(metadata);
  }

  async scanAndSyncDatabase(database: string): Promise<{ scanned: number, updated: number }> {
    const sps = await this.sqlRepo.listStoredProcedures(database);
    return this.syncStoredProcedures(database, sps);
  }

  async syncStoredProcedures(database: string, spsToSync: {schema: string, name: string}[]): Promise<{ scanned: number, updated: number }> {
    let updatedCount = 0;

    for (const sp of spsToSync) {
      const existingMeta = await this.metaRepo.getMetadata(database, sp.schema, sp.name);
      if (!existingMeta) {
        // Fetch definition to extract docs
        const def = await this.sqlRepo.getStoredProcedureDefinition(database, sp.schema, sp.name);
        if (def) {
          const newMeta = this.extractMetadataFromDefinition(def);
          await this.metaRepo.saveMetadata(newMeta);
          updatedCount++;
        }
      }
    }
    
    return { scanned: spsToSync.length, updated: updatedCount };
  }

  private extractMetadataFromDefinition(sp: StoredProcedureDefinition): SPMetadata {
    const defaultMeta: SPMetadata = {
      spName: sp.name,
      schema: sp.schema,
      database: sp.database,
      projectReferences: [],
      tablesUsed: [],
      lastScanDate: new Date()
    };
    
    if (!sp.definition) return defaultMeta;

    // 1. Try to extract Header Comments (/* ... */ or multiple -- lines at start)
    const commentBlockRegex = /\/\*([\s\S]*?)\*\/|((?:--.*(?:\r\n|\n))+)/;
    const match = commentBlockRegex.exec(sp.definition);
    
    if (match) {
      // Clean up comment characters
      const commentContent = (match[1] || match[2])
        .replace(/\/\*|\*\//g, '')
        .replace(/--/g, '')
        .trim();
      defaultMeta.description = commentContent;
    }

    // 2. Simple Regex for Table Usage (FROM [Table] or JOIN [Table])
    // This is naive but helpful.
    // Matches: FROM [Schema].[Table] or FROM Table
    // Regex explanation: FROM\s+ (ignore case) then capture word or bracketed word
    // It's tricky to get perfect without a SQL Parser, but basic regex works for many cases.
    
    return defaultMeta;
  }
}
