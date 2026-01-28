
import OpenAI from 'openai';

export class OpenAIService {
  private openai: OpenAI;
  private defaultModel: string;

  constructor(apiKey?: string, model?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    this.defaultModel = model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    
    this.openai = new OpenAI({
      apiKey: key,
    });
  }

  async generateSummary(spName: string, spDefinition: string, apiKey?: string): Promise<string> {
    try {
      const trimmedKey = apiKey?.trim();
      const keyToUse = trimmedKey || process.env.OPENAI_API_KEY;
      if (!keyToUse) {
        throw new Error("OpenAI API Key is missing.");
      }

      const client = trimmedKey ? new OpenAI({ apiKey: keyToUse }) : this.openai;

      const completion = await client.chat.completions.create({
        messages: [
          { 
              role: "system", 
              content: "Eres un experto en bases de datos SQL Server y lógica de negocio. Tu tarea es analizar el código de un procedimiento almacenado y generar un resumen conciso y claro en español. Explica qué hace, qué tablas afecta y cuál es su propósito de negocio. Usa formato Markdown." 
          },
          { 
              role: "user", 
              content: `Analiza el siguiente Stored Procedure llamado '${spName}':\n\n\`\`\`sql\n${spDefinition.substring(0, 15000)}\n\`\`\`` 
          }
        ],
        model: this.defaultModel,
      });

      return completion.choices[0].message.content || "No se pudo generar el resumen.";
    } catch (error) {
      const err = error as {
        message?: string;
        status?: number;
        code?: string;
        type?: string;
        error?: { message?: string; type?: string; code?: string };
      };
      console.error("OpenAI Error:", {
        message: err?.message,
        status: err?.status,
        code: err?.code,
        type: err?.type,
        error: err?.error,
      });
      const detail = err?.error?.message || err?.message || "Error desconocido";
      throw new Error(`Error al comunicarse con OpenAI: ${detail}`);
    }
  }
}
