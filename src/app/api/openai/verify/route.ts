import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";

    if (!apiKey) {
      return NextResponse.json({ valid: false, error: "Missing API key" }, { status: 400 });
    }

    const client = new OpenAI({ apiKey });
    await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 1,
    });

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("OpenAI Key Verify Error:", error);
    return NextResponse.json({ valid: false, error: "Invalid API key" }, { status: 401 });
  }
}
