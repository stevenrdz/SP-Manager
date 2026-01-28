
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Load env just in case, though mostly we rely on hardcoded Docker string or pre-loaded env if run via 'next' context
// For a standalone script, straightforward connection string is easiest if inside Docker.
// Inside Docker, mongo host is 'mongo'.
const MONGO_URI = process.env.DATABASE_URL || 'mongodb://mongo:27017/sp-metadata';
const OUT_FILE = path.join(process.cwd(), 'data/seed.json');
const META_FILE = path.join(process.cwd(), 'data/metadata.json');

const MetadataSchema = new mongoose.Schema({
  spName: { type: String, required: true },
  schema: { type: String, required: true },
  database: { type: String, required: true },
  description: String,
  projectReferences: [String],
  tablesUsed: [String],
  lastScanDate: Date
}, { strict: false });

const MetadataModel = mongoose.models.SPMetadata || mongoose.model('SPMetadata', MetadataSchema);

async function run() {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    console.log('Fetching all metadata...');
    // Fetch EVERYTHING. An empty filter {} matches all documents.
    const allDocs = await MetadataModel.find({}).lean();
    console.log(`Found ${allDocs.length} documents.`);

    const wrapper = {
      sps: allDocs // Wrap in 'sps' key if that matches import expectation, 
                   // BUT checking seed-init.js: body: JSON.stringify(json) -> route: const { sps } = body;
                   // So yes, it expects an object with an 'sps' array.
    };
    const metadataWrapper = {
      metadata: allDocs.map((m: any) => ({
        spName: m.spName,
        schema: m.schema,
        database: m.database,
        description: m.description,
        projectReferences: m.projectReferences,
        tablesUsed: m.tablesUsed,
        lastScanDate: m.lastScanDate
      }))
    };

    console.log(`Writing to ${OUT_FILE}...`);
    fs.writeFileSync(OUT_FILE, JSON.stringify(wrapper, null, 2));
    console.log(`Writing to ${META_FILE}...`);
    fs.writeFileSync(META_FILE, JSON.stringify(metadataWrapper, null, 2));
    console.log('✅ seed.json updated successfully.');

  } catch (err) {
    console.error('Error updating seed file:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();



