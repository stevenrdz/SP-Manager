import { getSpService } from "@/application/di";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: Promise<{
    db: string;
  }>
}

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/sps/{db}/scan:
 *   post:
 *     tags:
 *       - Stored Procedures
 *     summary: Escanear base de datos
 *     description: Escanea una base de datos específica para encontrar todos los stored procedures y sincronizarlos con MongoDB
 *     parameters:
 *       - in: path
 *         name: db
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la base de datos a escanear
 *         example: "TyT"
 *     responses:
 *       200:
 *         description: Escaneo completado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 scanned:
 *                   type: number
 *                   description: Número de SPs escaneados
 *                 synced:
 *                   type: number
 *                   description: Número de SPs sincronizados
 *       500:
 *         description: Error al escanear
 */
export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { db } = await params;
    const service = getSpService();
    const result = await service.scanAndSyncDatabase(db);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Error al escanear la base de datos' }, { status: 500 });
  }
}
