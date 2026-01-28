import { NextRequest } from 'next/server';
import { GET } from '@/app/api/projects/[projectName]/sps/route';

describe('GET /api/projects/[projectName]/sps', () => {
  it('should return SPs for existing project', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects/WebFormCapacitacion/sps');
    const params = Promise.resolve({ projectName: 'WebFormCapacitacion' });
    
    const response = await GET(req, { params });
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('should handle Unicode characters in project name', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects/Diseño/sps');
    const params = Promise.resolve({ projectName: 'Diseño' });
    
    const response = await GET(req, { params });
    expect([200, 404]).toContain(response.status); // 200 si existe, 404 si no
  });

  it('should return 400 for empty project name', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects//sps');
    const params = Promise.resolve({ projectName: '' });
    
    const response = await GET(req, { params });
    expect(response.status).toBe(400);
  });

  it('should return SP metadata with correct structure', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects/WebFormCapacitacion/sps');
    const params = Promise.resolve({ projectName: 'WebFormCapacitacion' });
    
    const response = await GET(req, { params });
    const data = await response.json();
    
    if (data.length > 0) {
      const sp = data[0];
      expect(sp).toHaveProperty('database');
      expect(sp).toHaveProperty('schema');
      expect(sp).toHaveProperty('spName');
      expect(sp).toHaveProperty('projectReferences');
      expect(Array.isArray(sp.projectReferences)).toBe(true);
    }
  });

  it('should handle special characters in project name', async () => {
    const specialNames = [
      'Test-Project',
      'Test_Project',
      'Test Project', // con espacio
      'Test&Project',
    ];

    for (const projectName of specialNames) {
      const req = new NextRequest(`http://localhost:3000/api/projects/${encodeURIComponent(projectName)}/sps`);
      const params = Promise.resolve({ projectName });
      
      const response = await GET(req, { params });
      // Debe retornar 200 o 404, no 500
      expect([200, 404]).toContain(response.status);
    }
  });
});
