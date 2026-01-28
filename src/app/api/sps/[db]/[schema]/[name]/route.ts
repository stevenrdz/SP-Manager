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
 * /api/sps/{db}/{schema}/{name}:
 *   get:
 *     tags:
 *       - Stored Procedures
 *     summary: Obtener detalles de un stored procedure
 *     description: Obtiene los detalles completos de un stored procedure específico incluyendo su definición y metadata
 *     parameters:
 *       - in: path
 *         name: db
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la base de datos
 *         example: "TyT"
 *       - in: path
 *         name: schema
 *         required: true
 *         schema:
 *           type: string
 *         description: Schema del stored procedure
 *         example: "dbo"
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del stored procedure
 *         example: "WEB_Seek_Cliente_Cedula"
 *     responses:
 *       200:
 *         description: Detalles del stored procedure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SPDetail'
 *       404:
 *         description: Stored procedure no encontrado
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     tags:
 *       - Stored Procedures
 *     summary: Actualizar metadata de un stored procedure
 *     description: Actualiza la metadata de un stored procedure (descripción, proyectos, etc.)
 *     parameters:
 *       - in: path
 *         name: db
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: schema
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: name
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
 *       500:
 *         description: Error al actualizar metadata
 */
export async function GET(req: NextRequest, { params }: Props) {
  console.log('[ROUTE] ========== SP Detail Route Handler Called ==========');
  console.log('[ROUTE] Request URL:', req.url);
  
  try {
    const resolvedParams = await params;
    console.log('[ROUTE] Resolved params:', resolvedParams);
    
    const { db, schema, name } = resolvedParams;
    console.log(`[ROUTE] Extracted: db="${db}", schema="${schema}", name="${name}"`);
    
    console.log('[ROUTE] Getting service instance...');
    const service = getSpService();
    
    console.log('[ROUTE] Calling service.getProcedureDetails...');
    const details = await service.getProcedureDetails(db, schema, name);
    console.log('[ROUTE] Service returned:', details ? 'DATA' : 'NULL');
    
    if (!details) {
      console.error(`[ROUTE] ❌ SP not found: ${db}.${schema}.${name}`);
      return NextResponse.json({ error: 'Stored Procedure no encontrado' }, { status: 404 });
    }
    
    console.log('[ROUTE] ✅ Returning SP details successfully');
    return NextResponse.json(details);
  } catch (error) {
    console.error('[ROUTE] ❌ ERROR:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Props) {
  try {
    const { db, schema, name } = await params;
    const body = await req.json();
    const service = getSpService();
    
    // Ensure keys match params to avoid inconsistency
    const metadata = {
      ...body,
      database: db,
      schema: schema,
      spName: name
    };
    
    await service.updateMetadata(metadata);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar metadata' }, { status: 500 });
  }
}
