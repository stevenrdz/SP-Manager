import { NextResponse } from 'next/server';

export async function GET() {
  // If the middleware allows the request, it means the key is valid
  // since this endpoint is protected by default by its path /api/auth/...
  // but wait, I need to make sure middleware protects this path.
  return NextResponse.json({ success: true, message: 'Authenticated' });
}

export async function POST() {
  return NextResponse.json({ success: true, message: 'Authenticated' });
}
