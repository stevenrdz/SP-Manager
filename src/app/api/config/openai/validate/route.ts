import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/config/openai/validate:
 *   post:
 *     tags:
 *       - Configuration
 *     summary: Validar API Key de OpenAI
 *     description: Valida que la API Key de OpenAI sea correcta y tenga los permisos necesarios
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
 *                 description: API Key de OpenAI a validar
 *                 example: "sk-..."
 *     responses:
 *       200:
 *         description: API Key válida
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
 *                   example: "API Key válida y funcional"
 *       400:
 *         description: API Key inválida (formato incorrecto)
 *       401:
 *         description: API Key sin permisos o inválida
 *       500:
 *         description: Error al validar la API Key
 */
export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || !apiKey.startsWith("sk-")) {
      return NextResponse.json(
        { message: "API Key inválida. Debe comenzar con 'sk-'" },
        { status: 400 }
      );
    }

    // Test the API key with OpenAI
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "API Key inválida o sin permisos" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "API Key válida y funcional",
    });
  } catch (error: any) {
    console.error("[API] OpenAI validation error:", error);
    return NextResponse.json(
      { message: "Error al validar la API Key" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
