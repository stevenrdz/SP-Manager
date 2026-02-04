import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/api/config/database/save',
  '/api/config/openai/save',
  '/api/scan',
  '/api/backup/import', // If re-enabled
  '/api/auth/validate'
];

// Routes that are fully open (docs, read-only lists)
// const PUBLIC_ROUTES = ['/api/doc', '/api/sps', '/api/databases', '/api/projects'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  let isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  // Also protect modifying SPs
  if (pathname.startsWith('/api/sps') && request.method !== 'GET') {
    isProtected = true;
  }
  
  if (pathname.startsWith('/api/sp-detail') && request.method !== 'GET') {
    isProtected = true;
  }

  if (isProtected) {
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.ADMIN_API_KEY;

    if (!apiKey) {
      console.warn('ADMIN_API_KEY is not set in environment variables. Allowing request (UNSAFE).');
      return NextResponse.next();
    }

    // Expecting "Basic <base64(admin:apikey)>" or just a custom header "x-api-key: <apikey>"
    // For simplicity with this current setup, let's support x-api-key which is easier to add in frontends
    // OR Basic Auth if we want standard browser prompts.
    
    // Let's implement x-api-key for programmatic use and Basic Auth for browser.
    
    // Check x-api-key header first
    const headerApiKey = request.headers.get('x-api-key');
    if (headerApiKey === apiKey) {
      return NextResponse.next();
    }

    // Check Basic Auth
    // Authorization: Basic base64(admin:apiKey)
    if (authHeader) {
      const [scheme, encoded] = authHeader.split(' ');
      if (scheme === 'Basic') {
        const decoded = atob(encoded);
        const [user, pass] = decoded.split(':');
        // We only care about the pass/key effectively, user can be 'admin'
        if (pass === apiKey) {
          return NextResponse.next();
        }
      }
    }

    // Return 401
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Authentication required' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
