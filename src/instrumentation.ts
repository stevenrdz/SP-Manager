export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Instrumentation] Registering startup hooks...');
    
    // We import dynamically to avoid issues with build-time evaluation if dependencies aren't ready
    // We import dynamically to avoid issues with build-time evaluation if dependencies aren't ready
    const { getSpService, getBackupService } = await import('@/application/di');

    try {
      const service = getSpService();
      const backupService = getBackupService();

      console.log('[Instrumentation] Fetching accessible databases...');
      
      const databases = await service.listDatabases();
      console.log(`[Instrumentation] Found ${databases.length} databases to sync: ${databases.join(', ')}`);

      // We don't want to block the startup, so we run this without await, 
      // but strictly speaking Next.js might kill the process/context if not careful.
      // However, for a persistent server (like in Docker "next start"), this background work should continue 
      // or at least be initiated.
      
      // Parallelize with concurrency limit (e.g. 5) to speed up 15+ databases without exhausting pool
      (async () => {
        const batchSize = 5;
        for (let i = 0; i < databases.length; i += batchSize) {
            const batch = databases.slice(i, i + batchSize);
            await Promise.all(batch.map(async (db) => {
                try {
                    console.log(`[Instrumentation] Starting sync for: ${db}`);
                    const result = await service.scanAndSyncDatabase(db);
                    console.log(`[Instrumentation] Sync complete for ${db}. Scanned: ${result.scanned}, Updated: ${result.updated}`);
                } catch (err) {
                    console.error(`[Instrumentation] Failed to sync ${db}:`, err);
                }
            }));
        }
        console.log('[Instrumentation] All startup sync tasks completed.');
        
        // Auto-update seed.json after sync
        console.log('[Instrumentation] Updating seed.json with latest data...');
        await backupService.exportToSeedFile();
        console.log('[Instrumentation] seed.json updated.');

        console.log('[Instrumentation] Updating metadata.json with latest data...');
        await backupService.exportMetadataToFile();
        console.log('[Instrumentation] metadata.json updated.');

      })();

    } catch (error) {
      console.error('[Instrumentation] Error during startup initialization:', error);
    }
  }
}
