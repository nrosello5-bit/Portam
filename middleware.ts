import { NextResponse, type NextRequest } from 'next/server'

export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|icons|manifest.json|sw.js).*)'],
}
