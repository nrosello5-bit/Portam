import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value ?? 'ca'
  const validLocales = ['ca', 'es']
  const resolvedLocale = validLocales.includes(locale) ? locale : 'ca'

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  }
})
