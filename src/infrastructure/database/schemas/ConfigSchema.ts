import mongoose, { Schema, Document } from 'mongoose';
import { AppConfig } from '@/domain/models/Config';

export interface ConfigDocument extends Omit<AppConfig, '_id'>, Omit<Document, '_id'> {
  _id: string;
}

const ConfigSchema = new Schema<ConfigDocument>({
  _id: {
    type: String,
    default: 'app-config', // Singleton document
  },
  database: {
    type: {
      type: String,
      enum: ['sqlserver', 'postgresql', 'mysql', 'oracle'],
      default: 'sqlserver',
    },
    server: String,
    user: String,
    password: String,
    database: String,
    port: Number,
  },
  openai: {
    apiKey: String,
    model: String,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
ConfigSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const ConfigModel = mongoose.models.Config || mongoose.model<ConfigDocument>('Config', ConfigSchema);
