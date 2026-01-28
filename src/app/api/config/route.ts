import { NextResponse } from 'next/server';
import { getConfigService } from '@/application/di';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/config:
 *   get:
 *     tags:
 *       - Configuration
 *     summary: Obtener configuración actual
 *     description: Obtiene la configuración actual de la aplicación (sin contraseñas sensibles)
 *     responses:
 *       200:
 *         description: Configuración obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 database:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: "sqlserver"
 *                     server:
 *                       type: string
 *                     database:
 *                       type: string
 *                     user:
 *                       type: string
 *                     port:
 *                       type: number
 *                 openai:
 *                   type: object
 *                   properties:
 *                     model:
 *                       type: string
 *                     hasApiKey:
 *                       type: boolean
 *       500:
 *         description: Error al obtener configuración
 */
export async function GET() {
  try {
    const service = getConfigService();
    const config = await service.getConfig();

    // Don't expose sensitive data
    const safeConfig = {
      database: config.database ? {
        type: config.database.type,
        server: config.database.server,
        database: config.database.database,
        user: config.database.user,
        port: config.database.port,
        // Don't send password
      } : null,
      openai: config.openai ? {
        model: config.openai.model,
        hasApiKey: !!config.openai.apiKey,
        // Don't send API key
      } : null,
    };

    return NextResponse.json(safeConfig);
  } catch (error: any) {
    console.error('[API] Error getting config:', error);
    return NextResponse.json(
      { error: 'Error al obtener la configuración' },
      { status: 500 }
    );
  }
}
