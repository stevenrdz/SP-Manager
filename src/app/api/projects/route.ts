import { NextResponse } from 'next/server';
import { getSpService } from '@/application/di';

/**
 * @swagger
 * /api/projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Listar todos los proyectos
 *     description: Obtiene la lista de todos los proyectos que tienen stored procedures asociados
 *     responses:
 *       200:
 *         description: Lista de proyectos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["WebFormCapacitacion", "PortalClientes", "AppMovil"]
 *       500:
 *         description: Error interno del servidor
 */
export async function GET() {
  try {
    const service = getSpService();
    const projects = await service.getAllProjects();
    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('[API] Error fetching projects:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
