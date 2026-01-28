import { NextRequest, NextResponse } from 'next/server';
import { getConfigService } from '@/application/di';
import { refreshSqlConnection } from '@/infrastructure/sqlConnection';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/config/database/save:
 *   post:
 *     tags:
 *       - Configuration
 *     summary: Guardar configuración de base de datos
 *     description: Guarda la configuración de SQL Server en MongoDB después de validar la conexión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - server
 *               - database
 *               - user
 *               - password
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [sqlserver, postgresql, mysql, oracle]
 *                 default: sqlserver
 *               server:
 *                 type: string
 *                 example: "localhost"
 *               database:
 *                 type: string
 *                 example: "TyT"
 *               user:
 *                 type: string
 *                 example: "sa"
 *               password:
 *                 type: string
 *                 example: "MyPassword123"
 *               port:
 *                 type: number
 *                 example: 1433
 *     responses:
 *       200:
 *         description: Configuración guardada exitosamente
 *       400:
 *         description: Datos inválidos o conexión fallida
 *       500:
 *         description: Error al guardar configuración
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type = 'sqlserver', server, database, user, password, port = 1433 } = body;

    if (!server || !database || !user || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const dbConfig = {
      type: type as 'sqlserver' | 'postgresql' | 'mysql' | 'oracle',
      server,
      database,
      user,
      password,
      port: parseInt(port.toString()),
    };

    // Test connection before saving
    const service = getConfigService();
    const testResult = await service.testDatabaseConnection(dbConfig);

    if (!testResult.success) {
      return NextResponse.json(
        { error: testResult.message },
        { status: 400 }
      );
    }

    // Save configuration
    await service.saveDatabaseConfig(dbConfig);

    // Refresh SQL connection to use new config
    try {
      await refreshSqlConnection();
    } catch (error) {
      console.error('[API] Error refreshing SQL connection:', error);
      // Don't fail if refresh fails, config is already saved
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración guardada exitosamente',
    });
  } catch (error: any) {
    console.error('[API] Error saving database config:', error);
    return NextResponse.json(
      { error: 'Error al guardar la configuración' },
      { status: 500 }
    );
  }
}
