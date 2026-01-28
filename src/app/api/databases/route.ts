import { getSpService } from "@/application/di";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/databases:
 *   get:
 *     tags:
 *       - Databases
 *     summary: Listar todas las bases de datos
 *     description: Obtiene la lista de todas las bases de datos disponibles en el servidor SQL Server configurado
 *     responses:
 *       200:
 *         description: Lista de bases de datos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["master", "TyT", "WebFormCapacitacion"]
 *       500:
 *         description: Error al obtener las bases de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener las bases de datos"
 *                 details:
 *                   type: string
 */
export async function GET() {
  try {
    const service = getSpService();
    const dbs = await service.listDatabases();
    return NextResponse.json(dbs);
  } catch (error) {
    console.error('Error fetching databases:', error);
    return NextResponse.json({ error: 'Error al obtener las bases de datos', details: String(error) }, { status: 500 });
  }
}
