import { NextRequest } from 'next/server';
import { GET } from '@/app/api/sps/route';

describe('GET /api/sps', () => {
  it('should return SPs for valid database and query', async () => {
    const req = new NextRequest('http://localhost:3000/api/sps?db=TyT&q=cliente');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('should handle Unicode in search query', async () => {
    const req = new NextRequest('http://localhost:3000/api/sps?db=TyT&q=trámite');
    const response = await GET(req);
    
    expect([200, 404]).toContain(response.status);
  });

  it('should return 400 for missing database parameter', async () => {
    const req = new NextRequest('http://localhost:3000/api/sps?q=test');
    const response = await GET(req);
    
    expect(response.status).toBe(400);
  });

  it('should handle empty query parameter', async () => {
    const req = new NextRequest('http://localhost:3000/api/sps?db=TyT&q=');
    const response = await GET(req);
    
    expect([200, 400]).toContain(response.status);
  });

  it('should return SP metadata with correct structure', async () => {
    const req = new NextRequest('http://localhost:3000/api/sps?db=TyT&q=cliente');
    const response = await GET(req);
    const data = await response.json();

    if (response.status === 200 && data.length > 0) {
      const sp = data[0];
      expect(sp).toHaveProperty('schema');
      expect(sp).toHaveProperty('name');
      expect(typeof sp.schema).toBe('string');
      expect(typeof sp.name).toBe('string');
    }
  });

  it('should handle special characters in query', async () => {
    const specialQueries = ['test-sp', 'test_sp', 'test sp', 'test&sp'];
    
    for (const query of specialQueries) {
      const req = new NextRequest(`http://localhost:3000/api/sps?db=TyT&q=${encodeURIComponent(query)}`);
      const response = await GET(req);
      
      // Should not crash, return 200 or 404
      expect([200, 404, 400]).toContain(response.status);
    }
  });
});
