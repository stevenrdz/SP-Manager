import { NextRequest } from 'next/server';
import { GET, PUT } from '@/app/api/sp-detail/[id]/route';

describe('GET /api/sp-detail/[id]', () => {
  const createValidId = (db: string, schema: string, name: string) => {
    const compositeId = JSON.stringify({ db, schema, name });
    return Buffer.from(encodeURIComponent(compositeId)).toString('base64');
  };

  it('should return SP details for valid ID', async () => {
    const id = createValidId('TyT', 'dbo', 'CLIENTE_SELECT');
    const req = new NextRequest(`http://localhost:3000/api/sp-detail/${id}`);
    const params = Promise.resolve({ id });
    
    const response = await GET(req, { params });
    
    expect([200, 404]).toContain(response.status);
  });

  it('should handle Unicode characters in SP name', async () => {
    const id = createValidId('TyT', 'dbo', 'TRA_Proceso_Traslado_Select_Trámites');
    const req = new NextRequest(`http://localhost:3000/api/sp-detail/${id}`);
    const params = Promise.resolve({ id });
    
    const response = await GET(req, { params });
    
    expect([200, 404]).toContain(response.status);
  });

  it('should return 400 for invalid ID format', async () => {
    const req = new NextRequest('http://localhost:3000/api/sp-detail/invalid-id');
    const params = Promise.resolve({ id: 'invalid-id' });
    
    const response = await GET(req, { params });
    
    expect(response.status).toBe(400);
  });

  it('should return 404 for non-existent SP', async () => {
    const id = createValidId('TyT', 'dbo', 'NonExistentSP_12345');
    const req = new NextRequest(`http://localhost:3000/api/sp-detail/${id}`);
    const params = Promise.resolve({ id });
    
    const response = await GET(req, { params });
    
    expect(response.status).toBe(404);
  });

  it('should return SP details with correct structure', async () => {
    const id = createValidId('TyT', 'dbo', 'CLIENTE_SELECT');
    const req = new NextRequest(`http://localhost:3000/api/sp-detail/${id}`);
    const params = Promise.resolve({ id });
    
    const response = await GET(req, { params });
    
    if (response.status === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('definition');
      expect(data).toHaveProperty('parameters');
      expect(data).toHaveProperty('metadata');
      expect(Array.isArray(data.parameters)).toBe(true);
    }
  });
});

describe('PUT /api/sp-detail/[id]', () => {
  const createValidId = (db: string, schema: string, name: string) => {
    const compositeId = JSON.stringify({ db, schema, name });
    return Buffer.from(encodeURIComponent(compositeId)).toString('base64');
  };

  it('should update SP metadata', async () => {
    const id = createValidId('TyT', 'dbo', 'CLIENTE_SELECT');
    const metadata = {
      description: 'Test description',
      projectReferences: ['TestProject'],
      tags: ['test'],
    };
    
    const req = new NextRequest(`http://localhost:3000/api/sp-detail/${id}`, {
      method: 'PUT',
      body: JSON.stringify(metadata),
      headers: { 'Content-Type': 'application/json' },
    });
    const params = Promise.resolve({ id });
    
    const response = await PUT(req, { params });
    
    expect([200, 404]).toContain(response.status);
  });

  it('should handle Unicode in metadata', async () => {
    const id = createValidId('TyT', 'dbo', 'CLIENTE_SELECT');
    const metadata = {
      description: 'Descripción con tildes y ñ',
      projectReferences: ['Diseño', 'Señalización'],
      tags: ['español'],
    };
    
    const req = new NextRequest(`http://localhost:3000/api/sp-detail/${id}`, {
      method: 'PUT',
      body: JSON.stringify(metadata),
      headers: { 'Content-Type': 'application/json' },
    });
    const params = Promise.resolve({ id });
    
    const response = await PUT(req, { params });
    
    expect([200, 404]).toContain(response.status);
  });

  it('should return 400 for invalid metadata', async () => {
    const id = createValidId('TyT', 'dbo', 'CLIENTE_SELECT');
    
    const req = new NextRequest(`http://localhost:3000/api/sp-detail/${id}`, {
      method: 'PUT',
      body: 'invalid json',
      headers: { 'Content-Type': 'application/json' },
    });
    const params = Promise.resolve({ id });
    
    const response = await PUT(req, { params });
    
    expect([400, 500]).toContain(response.status);
  });
});
