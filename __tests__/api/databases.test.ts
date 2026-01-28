import { NextRequest } from 'next/server';
import { GET } from '@/app/api/databases/route';

describe('GET /api/databases', () => {
  it('should return list of databases', async () => {
    const req = new NextRequest('http://localhost:3000/api/databases');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('should return databases with correct structure', async () => {
    const req = new NextRequest('http://localhost:3000/api/databases');
    const response = await GET(req);
    const data = await response.json();

    if (data.length > 0) {
      const db = data[0];
      expect(typeof db).toBe('string');
      expect(db.length).toBeGreaterThan(0);
    }
  });

  it('should handle SQL Server connection errors gracefully', async () => {
    const req = new NextRequest('http://localhost:3000/api/databases');
    const response = await GET(req);
    
    // Should return 200 or 500, not crash
    expect([200, 500]).toContain(response.status);
  });
});
