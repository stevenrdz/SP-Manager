import { getSpService } from "@/application/di";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/sps:
 *   get:
 *     tags:
 *       - Stored Procedures
 *     summary: Buscar stored procedures
 *     description: Busca stored procedures por base de datos y/o término de búsqueda
 *     parameters:
 *       - in: query
 *         name: db
 *         schema:
 *           type: string
 *         description: Nombre de la base de datos
 *         example: "TyT"
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar SPs
 *         example: "WEB_Seek"
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [mongo, sql]
 *           default: mongo
 *         description: Fuente de datos (MongoDB o SQL Server)
 *         example: "mongo"
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [name, code]
 *           default: name
 *         description: Modo de búsqueda (por nombre o dentro del código)
 *         example: "code"
 *     responses:
 *       200:
 *         description: Lista de stored procedures encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   schema:
 *                     type: string
 *                   database:
 *                     type: string
 *                   objectId:
 *                     type: number
 *                   snippet:
 *                     type: string
 *       400:
 *         description: Parámetros requeridos faltantes
 *       500:
 *         description: Error al buscar procedimientos
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const db = searchParams.get('db') || undefined;
  const search = searchParams.get('q') || undefined;
  const mode = searchParams.get('mode') || 'name';
  const source = (searchParams.get('source') as 'mongo' | 'sql') || 'mongo';

  if (!db && !search) {
    return NextResponse.json({ error: 'Se requiere base de datos o término de búsqueda' }, { status: 400 });
  }

  try {
    const service = getSpService();
    
    if (mode === 'code' && search) {
      const sps = await service.searchInCode(search);
      return NextResponse.json(sps);
    }

    const sps = await service.searchStoredProcedures(db, search, source);
    return NextResponse.json(sps);
  } catch (error) {
    console.error('Search SPs Error:', error);
    return NextResponse.json({ error: 'Error al buscar procedimientos' }, { status: 500 });
  }
}
