import { NextRequest, NextResponse } from 'next/server';
import { getSpService } from '@/application/di';

/**
 * @swagger
 * /api/projects/{projectName}/sps:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Obtener SPs de un proyecto
 *     description: Obtiene todos los stored procedures asociados a un proyecto específico
 *     parameters:
 *       - in: path
 *         name: projectName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del proyecto
 *         example: "WebFormCapacitacion"
 *     responses:
 *       200:
 *         description: Lista de SPs del proyecto
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SPMetadata'
 *       400:
 *         description: Nombre de proyecto requerido
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectName: string }> }
) {
  try {
    const { projectName } = await params;
    
    if (!projectName) {
      return NextResponse.json(
        { error: 'El nombre del proyecto es requerido' },
        { status: 400 }
      );
    }

    const service = getSpService();
    const sps = await service.getSpsByProject(decodeURIComponent(projectName));
    
    return NextResponse.json(sps);
  } catch (error: any) {
    console.error('[API] Error fetching SPs by project:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
