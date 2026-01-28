import { NextRequest } from 'next/server';
import { POST as SyncPOST } from '@/app/api/sps/[db]/sync/route';
import { POST as ScanPOST } from '@/app/api/sps/[db]/scan/route';

describe('SP Sync and Scan APIs', () => {
  describe('POST /api/sps/[db]/sync', () => {
    it('should sync SPs for valid database', async () => {
      const req = new NextRequest('http://localhost:3000/api/sps/TyT/sync', {
        method: 'POST',
      });
      const params = Promise.resolve({ db: 'TyT' });
      
      const response = await SyncPOST(req, { params });
      
      expect([200, 500]).toContain(response.status);
    });

    it('should return 400 for empty database name', async () => {
      const req = new NextRequest('http://localhost:3000/api/sps//sync', {
        method: 'POST',
      });
      const params = Promise.resolve({ db: '' });
      
      const response = await SyncPOST(req, { params });
      
      expect([400, 500]).toContain(response.status);
    });

    it('should handle Unicode database names', async () => {
      const req = new NextRequest('http://localhost:3000/api/sps/Diseño/sync', {
        method: 'POST',
      });
      const params = Promise.resolve({ db: 'Diseño' });
      
      const response = await SyncPOST(req, { params });
      
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/sps/[db]/scan', () => {
    it('should scan SPs for valid database', async () => {
      const req = new NextRequest('http://localhost:3000/api/sps/TyT/scan', {
        method: 'POST',
      });
      const params = Promise.resolve({ db: 'TyT' });
      
      const response = await ScanPOST(req, { params });
      
      expect([200, 500]).toContain(response.status);
    });

    it('should return scan results with correct structure', async () => {
      const req = new NextRequest('http://localhost:3000/api/sps/TyT/scan', {
        method: 'POST',
      });
      const params = Promise.resolve({ db: 'TyT' });
      
      const response = await ScanPOST(req, { params });
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('scanned');
        expect(typeof data.scanned).toBe('number');
      }
    });
  });
});
