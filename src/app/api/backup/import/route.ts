import { getBackupService } from "@/application/di";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/backup/import:
 *   post:
 *     tags:
 *       - Backup
 *     summary: Importar backup de base de datos
 *     description: Importa metadatos de stored procedures desde un archivo JSON de backup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/SPMetadata'
 *               - type: object
 *                 properties:
 *                   sps:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/SPMetadata'
 *     responses:
 *       200:
 *         description: Backup importado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 imported:
 *                   type: number
 *                   description: Número de SPs importados
 *       400:
 *         description: Formato inválido
 *       500:
 *         description: Error al importar
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    let dataToImport = data;

    if (!Array.isArray(data)) {
        if (data.sps && Array.isArray(data.sps)) {
            dataToImport = data.sps;
        } else {
            return NextResponse.json({ error: 'Formato inválido. Se esperaba un array JSON o un objeto con clave "sps".' }, { status: 400 });
        }
    }

    const service = getBackupService();
    const result = await service.importDatabase(dataToImport);
    
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Import failed:', error);
    return NextResponse.json({ error: 'Error al importar el backup' }, { status: 500 });
  }
}
