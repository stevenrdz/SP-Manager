import { NextResponse } from "next/server";
import * as sql from 'mssql';

/**
 * @swagger
 * /api/config/database/test:
 *   post:
 *     tags:
 *       - Configuration
 *     summary: Probar conexión a base de datos SQL Server
 *     description: Valida las credenciales y prueba la conexión a una base de datos SQL Server
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - server
 *               - database
 *             properties:
 *               server:
 *                 type: string
 *                 description: Dirección del servidor SQL Server
 *                 example: "192.168.0.245"
 *               database:
 *                 type: string
 *                 description: Nombre de la base de datos
 *                 example: "TyT"
 *               username:
 *                 type: string
 *                 description: Usuario de SQL Server
 *                 example: "sa"
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Conexión exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Conexión exitosa a la base de datos"
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error al conectar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: Request) {
  try {
    const { server, database, username, password } = await request.json();

    // Validate required fields
    if (!server || !database) {
      return NextResponse.json(
        { message: "Servidor y base de datos son requeridos" },
        { status: 400 }
      );
    }

    // Test the actual connection
    const config: sql.config = {
      server,
      database,
      user: username,
      password,
      port: 1433,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    };

    console.log('[API] Testing database connection to:', server, database);

    try {
      const pool = await new sql.ConnectionPool(config).connect();
      await pool.close();
      
      console.log('[API] ✅ Connection successful');
      
      return NextResponse.json({
        success: true,
        message: "Conexión exitosa a la base de datos",
      });
    } catch (dbError: any) {
      console.error('[API] ❌ Connection failed:', dbError.message);
      
      return NextResponse.json(
        { 
          success: false,
          message: `Error de conexión: ${dbError.message}` 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[API] Database test error:", error);
    return NextResponse.json(
      { message: error.message || "Error al probar la conexión" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
