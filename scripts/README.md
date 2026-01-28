# Scripts Directory

This directory contains utility scripts for the SP Manager project.

## Available Scripts

### `export-database.ps1`

Exports all tables and their associated stored procedures from SQL Server.

**Features:**

- Reads credentials from `.env` file automatically
- Exports table schemas with columns
- Finds all SPs that reference each table
- Generates multiple output formats:
  - JSON (complete data)
  - CSV (for Excel/spreadsheet viewing)
  - TXT (summary report)

**Usage:**

```powershell
# Run from project root
.\scripts\export-database.ps1

# Specify custom output directory
.\scripts\export-database.ps1 -OutputPath "C:\exports"
```

**Output Files:**

- `database-export.json` - Complete export in JSON format
- `tables-and-sps.csv` - Tabular data for Excel
- `export-summary.txt` - Human-readable summary

**Requirements:**

- PowerShell 5.1 or higher
- SQL Server connection from the machine
- Valid credentials in `.env` file

**Example Output:**

```
=== Database Export Script ===
Server: 192.168.216.38
Database: MyDatabase
User: dbuser

✓ Connected to SQL Server
✓ Found 156 tables

Processing table: dbo.Clientes
  ├─ Columns: 25
  └─ Associated SPs: 12

...

=== Export Complete ===
Files created:
  - .\exports\database-export.json
  - .\exports\export-summary.txt
  - .\exports\tables-and-sps.csv
```

### `update-seed.ts`

Updates seed data for the application (existing script).

---

## Adding New Scripts

When adding new scripts:

1. Place them in this directory
2. Update this README with documentation
3. Use `.env` for credentials when possible
4. Follow the naming convention: `verb-noun.ext`
