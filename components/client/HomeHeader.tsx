'use client'

import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapPin, Search } from 'lucide-react'
import { useCallback, useState } from 'react'

export default function HomeHeader() {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value)
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('q', value)
      } else {
        params.delete('q')
      }
      router.push(`/?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <header className="bg-primary-500 pt-safe">
      <div className="px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 text-white/80 text-sm">
            <MapPin size={14} />
            <span>L&apos;Ametlla del Vallès</span>
          </div>
          <span className="text-white text-2xl font-bold tracking-tight">
            Porta&apos;m
          </span>
        </div>

        <p className="text-white/80 text-sm mb-4">{t('common.tagline')}</p>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('home.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
          />
        </div>
      </div>
    </header>
  )
}
