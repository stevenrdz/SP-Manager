import { NextRequest, NextResponse } from 'next/server';
import { getConfigService } from '@/application/di';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/config/openai/save:
 *   post:
 *     tags:
 *       - Configuration
 *     summary: Guardar configuración de OpenAI
 *     description: Guarda la configuración de OpenAI en MongoDB
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apiKey
 *             properties:
 *               apiKey:
 *                 type: string
 *                 example: "sk-..."
 *               model:
 *                 type: string
 *                 example: "gpt-4o-mini"
 *     responses:
 *       200:
 *         description: Configuración guardada exitosamente
 *       400:
 *         description: API Key requerida
 *       500:
 *         description: Error al guardar configuración
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, model = 'gpt-4o-mini' } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key es requerida' },
        { status: 400 }
      );
    }

    const aiConfig = {
      apiKey: apiKey.trim(),
      model,
    };

    // Save configuration
    const service = getConfigService();
    await service.saveOpenAIConfig(aiConfig);

    return NextResponse.json({
      success: true,
      message: 'Configuración de OpenAI guardada exitosamente',
    });
  } catch (error: any) {
    console.error('[API] Error saving OpenAI config:', error);
    return NextResponse.json(
      { error: 'Error al guardar la configuración' },
      { status: 500 }
    );
  }
}
