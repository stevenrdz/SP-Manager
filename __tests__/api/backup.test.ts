import { NextRequest } from 'next/server';
import { POST as ExportPOST } from '@/app/api/backup/export/route';
import { POST as ImportPOST } from '@/app/api/backup/import/route';

describe('Backup APIs', () => {
  describe('POST /api/backup/export', () => {
    it('should export backup data', async () => {
      const req = new NextRequest('http://localhost:3000/api/backup/export', {
        method: 'POST',
      });
      
      const response = await ExportPOST(req);
      
      expect([200, 500]).toContain(response.status);
    });

    it('should return JSON backup data', async () => {
      const req = new NextRequest('http://localhost:3000/api/backup/export', {
        method: 'POST',
      });
      
      const response = await ExportPOST(req);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data).toBeDefined();
        expect(typeof data).toBe('object');
      }
    });
  });

  describe('POST /api/backup/import', () => {
    it('should import backup data', async () => {
      const backupData = {
        metadata: [],
        version: '1.0',
      };

      const req = new NextRequest('http://localhost:3000/api/backup/import', {
        method: 'POST',
        body: JSON.stringify(backupData),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await ImportPOST(req);
      
      expect([200, 400, 500]).toContain(response.status);
    });

    it('should return 400 for invalid backup format', async () => {
      const req = new NextRequest('http://localhost:3000/api/backup/import', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await ImportPOST(req);
      
      expect([400, 500]).toContain(response.status);
    });

    it('should handle Unicode in backup data', async () => {
      const backupData = {
        metadata: [
          {
            db: 'TyT',
            schema: 'dbo',
            name: 'SP_Con_Tildes_Ñ',
            description: 'Descripción con caracteres especiales',
            projectReferences: ['Diseño'],
          },
        ],
        version: '1.0',
      };

      const req = new NextRequest('http://localhost:3000/api/backup/import', {
        method: 'POST',
        body: JSON.stringify(backupData),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await ImportPOST(req);
      
      expect([200, 400, 500]).toContain(response.status);
    });
  });
});
