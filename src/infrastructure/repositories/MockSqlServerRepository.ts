import { ISqlRepository } from '@/domain/repositories';
import { StoredProcedureCore, StoredProcedureDefinition } from '@/domain/entities';
import mockSps from '@/data/mock-sps.json';

export class MockSqlServerRepository implements ISqlRepository {
  private mockData: any[] = mockSps;

  async listDatabases(): Promise<string[]> {
    const databases = [...new Set(this.mockData.map(sp => sp.database))];
    return databases.sort();
  }

  async listStoredProcedures(database: string, search?: string): Promise<StoredProcedureCore[]> {
    let filtered = this.mockData.filter(sp => sp.database === database);
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(sp =>
        sp.name.toLowerCase().includes(lowerSearch) ||
        sp.schema.toLowerCase().includes(lowerSearch) ||
        sp.description?.toLowerCase().includes(lowerSearch)
      );
    }

    return filtered.map(sp => ({
      database: sp.database,
      schema: sp.schema,
      name: sp.name,
      objectId: sp.objectId,
      createdDate: sp.createdDate,
      modifiedDate: sp.modifiedDate,
    }));
  }

  async getStoredProcedureDefinition(
    database: string,
    schema: string,
    name: string
  ): Promise<StoredProcedureDefinition | null> {
    const sp = this.mockData.find(
      sp => sp.database === database && sp.schema === schema && sp.name === name
    );
    
    if (!sp) return null;

    return {
      database: sp.database,
      schema: sp.schema,
      name: sp.name,
      objectId: sp.objectId,
      definition: sp.definition,
      createdDate: sp.createdDate,
      modifiedDate: sp.modifiedDate,
    };
  }
}
