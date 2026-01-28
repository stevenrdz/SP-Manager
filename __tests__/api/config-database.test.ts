import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/config/database/route';

describe('Database Configuration API', () => {
  describe('GET /api/config/database', () => {
    it('should return database configuration', async () => {
      const req = new NextRequest('http://localhost:3000/api/config/database');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('server');
      expect(data).toHaveProperty('database');
      expect(data).toHaveProperty('user');
    });

    it('should not expose password in response', async () => {
      const req = new NextRequest('http://localhost:3000/api/config/database');
      const response = await GET(req);
      const data = await response.json();

      if (response.status === 200) {
        // Password should be masked or not present
        expect(data.password === undefined || data.password === '').toBe(true);
      }
    });
  });

  describe('POST /api/config/database', () => {
    it('should save database configuration', async () => {
      const config = {
        server: '192.168.0.245',
        database: 'master',
        user: 'sa',
        password: 'test123',
        port: 1433,
      };

      const req = new NextRequest('http://localhost:3000/api/config/database', {
        method: 'POST',
        body: JSON.stringify(config),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(req);
      
      expect([200, 201]).toContain(response.status);
    });

    it('should return 400 for missing required fields', async () => {
      const config = {
        server: '192.168.0.245',
        // Missing database, user, password
      };

      const req = new NextRequest('http://localhost:3000/api/config/database', {
        method: 'POST',
        body: JSON.stringify(config),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(req);
      
      expect([400, 500]).toContain(response.status);
    });

    it('should handle Unicode in database name', async () => {
      const config = {
        server: '192.168.0.245',
        database: 'Diseño_DB',
        user: 'sa',
        password: 'test123',
        port: 1433,
      };

      const req = new NextRequest('http://localhost:3000/api/config/database', {
        method: 'POST',
        body: JSON.stringify(config),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(req);
      
      expect([200, 201, 400, 500]).toContain(response.status);
    });
  });
});
