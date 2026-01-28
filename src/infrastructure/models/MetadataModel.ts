import mongoose, { Schema, Model } from 'mongoose';
import { SPMetadata } from '@/domain/entities';

const SPMetadataSchema = new Schema<SPMetadata>({
  spName: { type: String, required: true },
  schema: { type: String, required: true },
  database: { type: String, required: true },
  description: { type: String },
  author: { type: String },
  projectReferences: { type: [String], default: [] },
  tablesUsed: { type: [String], default: [] },
  lastScanDate: { type: Date, default: Date.now }
});

// Composite index to ensure uniqueness per SP in a DB
SPMetadataSchema.index({ database: 1, schema: 1, spName: 1 }, { unique: true });

export const MetadataModel: Model<SPMetadata> = mongoose.models.SPMetadata || mongoose.model<SPMetadata>('SPMetadata', SPMetadataSchema);
