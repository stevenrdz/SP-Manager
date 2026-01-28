import { IMetadataRepository } from '@/domain/repositories';
import { SPMetadata } from '@/domain/entities';
import mockSps from '@/data/mock-sps.json';

export class MockMetadataRepository implements IMetadataRepository {
  private metadata: Map<string, SPMetadata> = new Map();

  constructor() {
    // Initialize with mock data
    mockSps.forEach(sp => {
      const key = `${sp.database}_${sp.schema}_${sp.name}`;
      this.metadata.set(key, {
        database: sp.database,
        schema: sp.schema,
        spName: sp.name,
        description: sp.description,
        projectReferences: sp.projectReferences || [],
        tablesUsed: sp.tablesUsed || [],
        lastScanDate: new Date(sp.lastScanned || new Date()),
      });
    });
  }

  async getMetadata(
    database: string,
    schema: string,
    spName: string
  ): Promise<SPMetadata | null> {
    const key = `${database}_${schema}_${spName}`;
    return this.metadata.get(key) || null;
  }

  async saveMetadata(metadata: SPMetadata): Promise<void> {
    const key = `${metadata.database}_${metadata.schema}_${metadata.spName}`;
    this.metadata.set(key, metadata);
  }

  async listMetadata(database: string): Promise<SPMetadata[]> {
    return Array.from(this.metadata.values()).filter(
      m => m.database === database
    );
  }

  async searchAllMetadata(query: string): Promise<SPMetadata[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.metadata.values()).filter(
      m => 
        m.spName.toLowerCase().includes(lowerQuery) ||
        m.description?.toLowerCase().includes(lowerQuery)
    );
  }

  async findAllMetadata(): Promise<SPMetadata[]> {
    return Array.from(this.metadata.values());
  }

  async getAllProjects(): Promise<string[]> {
    const projects = new Set<string>();
    Array.from(this.metadata.values()).forEach(m => {
      m.projectReferences?.forEach(p => projects.add(p));
    });
    return Array.from(projects).sort();
  }

  async getSpsByProject(projectName: string): Promise<SPMetadata[]> {
    return Array.from(this.metadata.values()).filter(m =>
      m.projectReferences?.includes(projectName)
    );
  }

  async getStatistics(): Promise<{
    totalSPs: number;
    totalByDatabase: { database: string; count: number }[];
    documented: number;
    undocumented: number;
    topProjects: { project: string; count: number }[];
  }> {
    const all = Array.from(this.metadata.values());
    const totalSPs = all.length;

    // By DB
    const dbCounts = new Map<string, number>();
    all.forEach(m => {
      dbCounts.set(m.database, (dbCounts.get(m.database) || 0) + 1);
    });
    const totalByDatabase = Array.from(dbCounts.entries()).map(([database, count]) => ({
      database,
      count
    }));

    // Documented vs Undocumented
    const documented = all.filter(m => m.description && m.description.length > 0).length;
    const undocumented = totalSPs - documented;

    // Top projects
    const projCounts = new Map<string, number>();
    all.forEach(m => {
      m.projectReferences.forEach(p => {
        projCounts.set(p, (projCounts.get(p) || 0) + 1);
      });
    });
    const topProjects = Array.from(projCounts.entries())
      .map(([project, count]) => ({ project, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalSPs,
      totalByDatabase,
      documented,
      undocumented,
      topProjects
    };
  }
}
