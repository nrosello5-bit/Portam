import { type NextRequest, NextResponse } from 'next/server'

// Auth is handled at the page level (server components + supabase.auth.getUser())
// Middleware only handles static asset exclusions
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
