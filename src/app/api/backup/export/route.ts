import { getBackupService } from "@/application/di";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/backup/export:
 *   get:
 *     tags:
 *       - Backup
 *     summary: Exportar backup de base de datos
 *     description: Exporta todos los metadatos de stored procedures de una base de datos específica en formato JSON
 *     parameters:
 *       - in: query
 *         name: db
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la base de datos a exportar
 *         example: "TyT"
 *     responses:
 *       200:
 *         description: Backup exportado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sps:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SPMetadata'
 *       400:
 *         description: Base de datos requerida
 *       500:
 *         description: Error al exportar
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const db = searchParams.get('db');

  if (!db) {
    return NextResponse.json({ error: 'La base de datos es requerida' }, { status: 400 });
  }

  try {
    const service = getBackupService();
    const data = await service.exportDatabase(db);
    
    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup-${db}-${new Date().toISOString().split('T')[0]}.json"`
      }
    });
  } catch (error) {
    console.error('Export failed:', error);
    return NextResponse.json({ error: 'Error al exportar el backup' }, { status: 500 });
  }
}
