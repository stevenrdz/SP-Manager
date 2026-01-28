# Data Directory

This directory stores exported backup files and seed data.

## Files

- **seed.example.json** - Example seed data with sample stored procedures (for documentation)
- **seed.json** - Actual seed data (git-ignored, create from your own database)
- **backup-\*.json** - Exported backups from the application (git-ignored)

## Usage

To create your own seed data:

1. Copy `seed.example.json` to `seed.json`
2. Replace with your actual stored procedure data
3. Or use the application's export feature to generate backups

## Note

All `.json` files except `seed.example.json` are ignored by git to prevent committing sensitive database information.
