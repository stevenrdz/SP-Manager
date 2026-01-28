import { NextRequest } from 'next/server';
import { GET } from '@/app/api/projects/route';

describe('GET /api/projects', () => {
  it('should return list of projects', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('should return unique project names', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects');
    const response = await GET(req);
    const data = await response.json();

    const uniqueProjects = new Set(data);
    expect(uniqueProjects.size).toBe(data.length);
  });

  it('should handle Unicode project names', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects');
    const response = await GET(req);
    const data = await response.json();

    // Verificar que puede manejar proyectos con tildes, ñ, etc.
    expect(response.status).toBe(200);
    data.forEach((project: string) => {
      expect(typeof project).toBe('string');
      expect(project.length).toBeGreaterThan(0);
    });
  });
});
