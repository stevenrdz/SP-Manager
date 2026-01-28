import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/config/openai/test:
 *   post:
 *     tags:
 *       - Configuration
 *     summary: Probar conexión con OpenAI
 *     description: Envía un prompt de prueba a OpenAI para validar la API Key y el modelo configurado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *               - apiKey
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Prompt de prueba para enviar a OpenAI
 *                 example: "Hola, ¿cómo estás?"
 *               apiKey:
 *                 type: string
 *                 description: API Key de OpenAI
 *                 example: "sk-..."
 *               model:
 *                 type: string
 *                 description: Modelo de OpenAI a utilizar
 *                 example: "gpt-4o-mini"
 *                 default: "gpt-4o-mini"
 *     responses:
 *       200:
 *         description: Respuesta exitosa de OpenAI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   description: Respuesta generada por OpenAI
 *                   example: "¡Hola! Estoy bien, gracias por preguntar."
 *       400:
 *         description: Prompt no proporcionado
 *       401:
 *         description: API Key no configurada
 *       429:
 *         description: Cuota excedida en OpenAI
 *       500:
 *         description: Error al llamar a OpenAI
 */
export async function POST(request: Request) {
  try {
    const { prompt, apiKey, model } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt es requerido" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key no configurada" },
        { status: 401 }
      );
    }

    // Use provided model or default to gpt-4o-mini
    const selectedModel = model || "gpt-4o-mini";

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 429) {
        return NextResponse.json(
          { 
            error: "Cuota excedida. Por favor revisa tu saldo en OpenAI.",
            details: error.error?.message,
            link: "https://platform.openai.com/settings/organization/billing/overview"
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: error.error?.message || "Error al llamar a OpenAI" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "No se recibió respuesta";

    return NextResponse.json({
      success: true,
      response: aiResponse,
    });
  } catch (error: any) {
    console.error("[API] OpenAI test error:", error);
    return NextResponse.json(
      { error: error.message || "Error al probar el prompt" },
      { status: 500 }
    );
  }
}
