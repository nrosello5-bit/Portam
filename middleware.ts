import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['ca', 'es'],
  defaultLocale: 'ca',
  localePrefix: 'never', // locale via cookie, not URL
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
