const fs = require('fs');
const path = require('path');

// This script is meant to be run in the Docker container where node is available.
// It uses fetch to call the internal API, assuming Next.js is already running.
// OR, more robustly, it connects directly to Mongo?
// Given this is a 'init' script in Docker, connecting to Mongo directly using mongoose is better
// but requires duplicating connection logic.

// Simpler approach for MVP:
// Wait for API to be ready, then POST the seed file.

const SEED_FILE = path.join(__dirname, '../data/seed.json');
const API_URL = 'http://localhost:3000/api/backup/import';

async function seed() {
    if (!fs.existsSync(SEED_FILE)) {
        console.log('No seed file found at', SEED_FILE);
        return;
    }

    console.log('Seed file found. Attempting to seed...');
    
    // Wait for server? Logic below assumes this runs *after* server start or in parallel with retries.
    // For "npm run dev", we can run this script in parallel and retry until success.

    let retries = 30; // 30 attempts * 2 seconds = 60 seconds max wait
    
    while(retries > 0) {
        try {
            const data = fs.readFileSync(SEED_FILE, 'utf8');
            const json = JSON.parse(data);

            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(json)
            });

            if (res.ok) {
                console.log('✅ Seeding completed successfully.');
                return;
            } else {
                 console.log('Seed API returned error:', res.status, await res.text());
            }

        } catch (e) {
            // Connection refused etc.
        }
        
        console.log(`Waiting for API (${retries})...`);
        retries--;
        await new Promise(r => setTimeout(r, 2000));
    }
    console.log('❌ Seeding failed or timed out.');
}

seed();
