import { NextResponse } from 'next/server';
import { getSpService } from '@/application/di';
export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/stats:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Obtener estadísticas del sistema
 *     description: Obtiene estadísticas generales sobre bases de datos, stored procedures y proyectos
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalDatabases:
 *                   type: number
 *                   description: Número total de bases de datos
 *                 totalSPs:
 *                   type: number
 *                   description: Número total de stored procedures
 *                 totalProjects:
 *                   type: number
 *                   description: Número total de proyectos
 *                 spsByDatabase:
 *                   type: object
 *                   description: SPs agrupados por base de datos
 *       500:
 *         description: Error interno del servidor
 */
export async function GET() {
  try {
    const service = getSpService();
    const stats = await service.getStatistics();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('[API] Error fetching statistics:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
