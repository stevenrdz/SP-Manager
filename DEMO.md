# Demo Mode Documentation

This project supports a fully functional "Demo Mode" that allows deployment to static hosting services like Vercel without requiring a connection to a real SQL Server database or MongoDB instance.

## How it Works

When Demo Mode is enabled, the application bypasses real database connections and instead uses in-memory mock repositories populated with realistic sample data.

### Repositories Replaced:

- **MockSqlServerRepository**: Simulates SQL Server connection, returns sample stored procedures.
- **MockMetadataRepository**: Stores metadata in memory (resets on reload).
- **MockConfigRepository**: Simulates configuration storage.

## Enabling Demo Mode

To enable Demo Mode, set the following environment variable:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

You can also rely on the provided `.env.demo` file or configure this in your Vercel project settings.

## Deploying to Vercel

1. **Push to GitHub**: Push the `demo` branch to your repository.
2. **Import Project**: In Vercel, import the repository.
3. **Environment Variables**: Add `NEXT_PUBLIC_DEMO_MODE=true`.
4. **Deploy**: Click Deploy.

## Sample Data

The demo mode includes 10 sample stored procedures across 3 different databases:

- **SalesDB**: eCommerce and sales reporting logic
- **InventoryDB**: Stock management and shipping
- **HRDB**: Employee salary and attendance

The data is defined in `src/data/mock-sps.json`.

## Limitations

- **Persistence**: All changes (metadata, descriptions, configuration) are stored in memory and will be lost when the page is reloaded or the server restarts (serverless function cold start).
- **Functionality**: "Scan Database" functionality simulates a scan but returns the same static data.
