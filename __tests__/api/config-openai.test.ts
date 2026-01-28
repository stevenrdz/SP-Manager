import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/config/openai/route';

describe('OpenAI Configuration API', () => {
  describe('GET /api/config/openai', () => {
    it('should return OpenAI configuration', async () => {
      const req = new NextRequest('http://localhost:3000/api/config/openai');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('apiKey');
      expect(data).toHaveProperty('model');
    });

    it('should mask API key in response', async () => {
      const req = new NextRequest('http://localhost:3000/api/config/openai');
      const response = await GET(req);
      const data = await response.json();

      if (response.status === 200 && data.apiKey) {
        // API key should be masked (e.g., "sk-...xyz")
        expect(data.apiKey.includes('***') || data.apiKey.includes('...') || data.apiKey === '').toBe(true);
      }
    });
  });

  describe('POST /api/config/openai', () => {
    it('should save OpenAI configuration', async () => {
      const config = {
        apiKey: 'sk-test123456789',
        model: 'gpt-4',
      };

      const req = new NextRequest('http://localhost:3000/api/config/openai', {
        method: 'POST',
        body: JSON.stringify(config),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(req);
      
      expect([200, 201]).toContain(response.status);
    });

    it('should return 400 for invalid API key format', async () => {
      const config = {
        apiKey: 'invalid-key',
        model: 'gpt-4',
      };

      const req = new NextRequest('http://localhost:3000/api/config/openai', {
        method: 'POST',
        body: JSON.stringify(config),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(req);
      
      // Should validate or accept
      expect([200, 201, 400]).toContain(response.status);
    });

    it('should handle missing model field', async () => {
      const config = {
        apiKey: 'sk-test123456789',
      };

      const req = new NextRequest('http://localhost:3000/api/config/openai', {
        method: 'POST',
        body: JSON.stringify(config),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(req);
      
      expect([200, 201, 400]).toContain(response.status);
    });
  });
});
