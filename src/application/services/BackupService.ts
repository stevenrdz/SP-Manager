import { IMetadataRepository } from "@/domain/repositories";
import { SPMetadata } from "@/domain/entities";

import fs from 'fs';
import path from 'path';

export class BackupService {
  constructor(private metaRepo: IMetadataRepository) {}

  async exportDatabase(database: string): Promise<SPMetadata[]> {
    return this.metaRepo.listMetadata(database);
  }

  async exportToSeedFile(): Promise<void> {
    try {
      const allData = await this.metaRepo.findAllMetadata();
      const seedPath = path.join(process.cwd(), 'data/seed.json');
      const data = { sps: allData }; // Wrap to match seed structure
      
      fs.writeFileSync(seedPath, JSON.stringify(data, null, 2));
      console.log(`[BackupService] Successfully updated seed.json with ${allData.length} records.`);
    } catch (error) {
      console.error('[BackupService] Failed to update seed.json:', error);
    }
  }

  async exportMetadataToFile(): Promise<void> {
    try {
      const allData = await this.metaRepo.findAllMetadata();
      const metadataPath = path.join(process.cwd(), 'data/metadata.json');
      const slim = allData.map((m) => ({
        spName: m.spName,
        schema: m.schema,
        database: m.database,
        description: m.description,
        projectReferences: m.projectReferences,
        tablesUsed: m.tablesUsed,
        lastScanDate: m.lastScanDate,
      }));
      const data = { metadata: slim };

      fs.writeFileSync(metadataPath, JSON.stringify(data, null, 2));
      console.log(`[BackupService] Successfully updated metadata.json with ${slim.length} records.`);
    } catch (error) {
      console.error('[BackupService] Failed to update metadata.json:', error);
    }
  }

  async importDatabase(data: SPMetadata[]): Promise<{ imported: number; errors: number }> {
    let imported = 0;
    let errors = 0;

    for (const item of data) {
      try {
        await this.metaRepo.saveMetadata(item);
        imported++;
      } catch (error) {
        console.error(`Error importing ${item.spName}:`, error);
        errors++;
      }
    }

    return { imported, errors };
  }
}
