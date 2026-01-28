
import { getSpService } from "@/application/di";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: Promise<{
    db: string;
    schema: string;
    name: string;
  }>
}

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/sps/{db}/{schema}/{name}/analyze:
 *   post:
 *     tags:
 *       - Stored Procedures
 *     summary: Analizar stored procedure con IA
 *     description: Utiliza OpenAI para analizar y documentar automáticamente un stored procedure
 *     parameters:
 *       - in: path
 *         name: db
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la base de datos
 *       - in: path
 *         name: schema
 *         required: true
 *         schema:
 *           type: string
 *         description: Schema del stored procedure
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del stored procedure
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apiKey:
 *                 type: string
 *                 description: API Key de OpenAI (opcional si ya está configurada)
 *     responses:
 *       200:
 *         description: Análisis completado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analysis:
 *                   type: string
 *                   description: Análisis generado por IA
 *       400:
 *         description: Parámetros faltantes
 *       404:
 *         description: Stored procedure no encontrado
 *       500:
 *         description: Error al analizar
 */
export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { db, schema, name } = await params;

    let apiKey: string | undefined;
    try {
      const body = await req.json();
      if (body?.apiKey && typeof body.apiKey === "string") {
        apiKey = body.apiKey;
      }
    } catch {
      // Ignore missing/invalid JSON
    }
    
    if (!db || !schema || !name) {
      return NextResponse.json({ error: 'Parámetros faltantes' }, { status: 400 });
    }

    const service = getSpService();
    const result = await service.analyzeStoredProcedure(db, schema, name, apiKey);

    if (!result) {
        return NextResponse.json({ error: 'Stored Procedure no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis failed:', error);
    return NextResponse.json({ error: 'Error al analizar el procedimiento', details: String(error) }, { status: 500 });
  }
}
