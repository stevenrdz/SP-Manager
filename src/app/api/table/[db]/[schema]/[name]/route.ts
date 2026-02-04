import { getSpService } from "@/application/di";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ db: string; schema: string; name: string }> }
) {
  try {
    const { db, schema, name } = await params;
    
    if (!db || !schema || !name) {
      return NextResponse.json({ error: 'Parámetros faltantes' }, { status: 400 });
    }

    const service = getSpService();
    const tableData = await service.getTableData(db, schema, name);
    
    if (!tableData) {
      return NextResponse.json({ error: 'Tabla no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(tableData);
  } catch (error) {
    console.error('[TABLE-ROUTE] Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
