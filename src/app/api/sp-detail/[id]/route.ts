import { getSpService } from "@/application/di";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: Promise<{
    id: string;
  }>
}

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/sp-detail/{id}:
 *   get:
 *     tags:
 *       - SP Detail
 *     summary: Obtener detalles de SP por ID
 *     description: Obtiene los detalles completos de un stored procedure usando un ID codificado en base64
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID codificado en base64 que contiene db, schema y name
 *     responses:
 *       200:
 *         description: Detalles del stored procedure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SPDetail'
 *       400:
 *         description: Formato de ID inválido
 *       404:
 *         description: Stored procedure no encontrado
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     tags:
 *       - SP Detail
 *     summary: Actualizar metadata de SP por ID
 *     description: Actualiza la metadata de un stored procedure usando un ID codificado en base64
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               projectReferences:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Metadata actualizada exitosamente
 *       400:
 *         description: Formato de ID inválido
 *       500:
 *         description: Error al actualizar metadata
 */
export async function GET(req: NextRequest, { params }: Props) {
  console.log('[ROUTE-ALT] ========== SP Detail Alternative Route (/[id]) Called ==========');
  
  try {
    const { id } = await params;
    console.log('[ROUTE-ALT] Received ID:', id);

    let decoded;
    try {
        // Decode base64 and handle UTF-8 encoded characters
        const base64Decoded = Buffer.from(id, 'base64').toString('binary');
        const utf8Decoded = decodeURIComponent(base64Decoded.split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        decoded = JSON.parse(utf8Decoded);
    } catch (e) {
        console.error('[ROUTE-ALT] Failed to decode ID:', e);
        return NextResponse.json({ error: 'Formato de ID inválido' }, { status: 400 });
    }

    const { db, schema, name } = decoded;
    console.log(`[ROUTE-ALT] Decoded: db="${db}", schema="${schema}", name="${name}"`);
    
    if (!db || !schema || !name) {
         return NextResponse.json({ error: 'Parámetros faltantes en el ID' }, { status: 400 });
    }

    const service = getSpService();
    const details = await service.getProcedureDetails(db, schema, name);
    
    if (!details) {
      console.error(`[ROUTE-ALT] ❌ SP not found: ${db}.${schema}.${name}`);
      return NextResponse.json({ error: 'Stored Procedure no encontrado' }, { status: 404 });
    }
    
    console.log('[ROUTE-ALT] ✅ Returning SP details successfully');
    return NextResponse.json(details);
  } catch (error) {
    console.error('[ROUTE-ALT] ❌ ERROR:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    
    let decoded;
    try {
        // Decode base64 and handle UTF-8 encoded characters
        const base64Decoded = Buffer.from(id, 'base64').toString('binary');
        const utf8Decoded = decodeURIComponent(base64Decoded.split('').map((c: string) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        decoded = JSON.parse(utf8Decoded);
    } catch (e) {
        return NextResponse.json({ error: 'Formato de ID inválido' }, { status: 400 });
    }

    const { db, schema, name } = decoded;
    const body = await req.json();
    const service = getSpService();
    
    const metadata = {
      ...body,
      database: db,
      schema: schema,
      spName: name
    };
    
    await service.updateMetadata(metadata);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ROUTE-ALT] PUT Error:', error);
    return NextResponse.json({ error: 'Error al actualizar metadata' }, { status: 500 });
  }
}
