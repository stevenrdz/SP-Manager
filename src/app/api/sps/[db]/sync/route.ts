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
 * /api/sps/{db}/sync:
 *   post:
 *     tags:
 *       - Stored Procedures
 *     summary: Sincronizar stored procedures
 *     description: Sincroniza una lista de stored procedures con MongoDB
 *     parameters:
 *       - in: path
 *         name: db
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la base de datos
 *         example: "TyT"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sps:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Lista de stored procedures a sincronizar
 *     responses:
 *       200:
 *         description: Sincronización exitosa
 *       400:
 *         description: Entrada inválida
 *       500:
 *         description: Error al sincronizar
 */
export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { db } = await params;
    const body = await req.json();
    const { sps } = body;

    if (!Array.isArray(sps)) {
       return NextResponse.json({ error: 'Entrada inválida: se requiere un array de SPs' }, { status: 400 });
    }

    const service = getSpService();
    const result = await service.syncStoredProcedures(db, sps);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al sincronizar los procedimientos' }, { status: 500 });
  }
}
