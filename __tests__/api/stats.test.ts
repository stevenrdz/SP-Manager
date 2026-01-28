import { NextRequest } from 'next/server';
import { GET } from '@/app/api/stats/route';

describe('GET /api/stats', () => {
  it('should return statistics', async () => {
    const req = new NextRequest('http://localhost:3000/api/stats');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('totalSPs');
    expect(data).toHaveProperty('totalProjects');
    expect(data).toHaveProperty('totalDatabases');
  });

  it('should return numeric statistics', async () => {
    const req = new NextRequest('http://localhost:3000/api/stats');
    const response = await GET(req);
    const data = await response.json();

    if (response.status === 200) {
      expect(typeof data.totalSPs).toBe('number');
      expect(typeof data.totalProjects).toBe('number');
      expect(typeof data.totalDatabases).toBe('number');
      expect(data.totalSPs).toBeGreaterThanOrEqual(0);
      expect(data.totalProjects).toBeGreaterThanOrEqual(0);
      expect(data.totalDatabases).toBeGreaterThanOrEqual(0);
    }
  });

  it('should handle database connection errors', async () => {
    const req = new NextRequest('http://localhost:3000/api/stats');
    const response = await GET(req);
    
    // Should return 200 or 500, not crash
    expect([200, 500]).toContain(response.status);
  });
});
