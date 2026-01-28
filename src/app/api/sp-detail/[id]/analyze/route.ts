
import { getSpService } from "@/application/di";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: Promise<{
    id: string; // db-schema-name encoded
  }>
}

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/sp-detail/{id}/analyze:
 *   post:
 *     tags:
 *       - SP Detail
 *     summary: Analizar SP por ID con IA
 *     description: Utiliza OpenAI para analizar y documentar automáticamente un stored procedure usando un ID codificado en base64
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID codificado en base64 que contiene db, schema y name
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
 *         description: Formato de ID inválido o parámetros faltantes
 *       404:
 *         description: Stored procedure no encontrado
 *       500:
 *         description: Error al analizar
 */
export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;

    let apiKey: string | undefined;
    try {
      const body = await req.json();
      if (body?.apiKey && typeof body.apiKey === "string") {
        apiKey = body.apiKey;
      }
    } catch {
      // Ignore missing/invalid JSON
    }
    
    let decoded;
    try {
        const jsonStr = Buffer.from(id, 'base64').toString('utf-8');
        decoded = JSON.parse(jsonStr);
    } catch (e) {
        return NextResponse.json({ error: 'Formato de ID inválido' }, { status: 400 });
    }

    const { db, schema, name } = decoded;
    
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
