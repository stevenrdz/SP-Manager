import { IMetadataRepository } from '@/domain/repositories';
import { SPMetadata } from '@/domain/entities';
import { MetadataModel } from '../models/MetadataModel';
import dbConnect from '../dbConnect';

export class MongoMetadataRepository implements IMetadataRepository {
  async getMetadata(database: string, schema: string, spName: string): Promise<SPMetadata | null> {
    await dbConnect();
    return MetadataModel.findOne({ database, schema, spName }).lean();
  }

  async saveMetadata(metadata: SPMetadata): Promise<void> {
    await dbConnect();
    await MetadataModel.findOneAndUpdate(
      { database: metadata.database, schema: metadata.schema, spName: metadata.spName },
      metadata,
      { upsert: true, new: true }
    );
  }

  async listMetadata(database: string): Promise<SPMetadata[]> {
    await dbConnect();
    return MetadataModel.find({ database }).lean();
  }

  async searchAllMetadata(query: string): Promise<SPMetadata[]> {
    await dbConnect();
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return MetadataModel.find({
      $or: [
        { spName: { $regex: escapedQuery, $options: 'i' } },
        { schema: { $regex: escapedQuery, $options: 'i' } }
      ]
    }).limit(100).lean();
  }

  async searchByCode(query: string): Promise<SPMetadata[]> {
    await dbConnect();
    // 1. Escape special regex characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // 2. Make it robust for SQL formatting:
    // - Replace literal spaces with \s+ (at least one whitespace)
    // - Allow optional spaces around parentheses and commas
    const regexQuery = escapedQuery
      .replace(/\s+/g, '\\s+')
      .replace(/\\\(|\\\)|\\,/g, '\\s*$&\\s*');
    
    return MetadataModel.find({
      cleanDefinition: { $regex: regexQuery, $options: 'i' }
    }).limit(100).lean();
  }

  async findAllMetadata(): Promise<SPMetadata[]> {
    await dbConnect();
    return MetadataModel.find({}).lean();
  }

  async getAllProjects(): Promise<string[]> {
    await dbConnect();
    const projects = await MetadataModel.distinct('projectReferences');
    return projects.filter((p: string | any) => typeof p === 'string' && p.trim() !== '');
  }

  async getSpsByProject(projectName: string): Promise<SPMetadata[]> {
    await dbConnect();
    return MetadataModel.find({
      projectReferences: projectName
    }).lean();
  }

  async getStatistics(): Promise<{
    totalSPs: number;
    totalByDatabase: { database: string; count: number }[];
    documented: number;
    undocumented: number;
    topProjects: { project: string; count: number }[];
  }> {
    await dbConnect();
    
    const totalSPs = await MetadataModel.countDocuments();
    const documented = await MetadataModel.countDocuments({ description: { $exists: true, $ne: '' } });
    const undocumented = totalSPs - documented;

    // Group by database
    const byDatabase = await MetadataModel.aggregate([
      { $group: { _id: '$database', count: { $sum: 1 } } },
      { $project: { database: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    // Top projects
    const projectAgg = await MetadataModel.aggregate([
      { $unwind: '$projectReferences' },
      { $group: { _id: '$projectReferences', count: { $sum: 1 } } },
      { $project: { project: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    return {
      totalSPs,
      totalByDatabase: byDatabase,
      documented,
      undocumented,
      topProjects: projectAgg
    };
  }
}
