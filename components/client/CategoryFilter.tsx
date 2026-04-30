'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { MerchantCategory } from '@/types'
import { MERCHANT_CATEGORY_LABELS } from '@/types'

const CATEGORIES: Array<{ id: MerchantCategory | 'all'; emoji: string }> = [
  { id: 'all', emoji: '🏪' },
  { id: 'restaurants', emoji: '🍕' },
  { id: 'farmacies', emoji: '💊' },
  { id: 'supermercats', emoji: '🛒' },
  { id: 'flors', emoji: '💐' },
  { id: 'altres', emoji: '📦' },
]

interface CategoryFilterProps {
  selectedCategory: MerchantCategory | 'all'
}

export default function CategoryFilter({ selectedCategory }: CategoryFilterProps) {
  const t = useTranslations('categories')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSelect = (categoryId: MerchantCategory | 'all') => {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId === 'all') {
      params.delete('category')
    } else {
      params.set('category', categoryId)
    }
    router.push(`/?${params.toString()}`)
  }

  const getLabel = (id: MerchantCategory | 'all') => {
    if (id === 'all') return tCommon('all')
    return t(id)
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      {CATEGORIES.map(({ id, emoji }) => {
        const isActive = selectedCategory === id
        return (
          <button
            key={id}
            onClick={() => handleSelect(id)}
            className={cn(
              'flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border transition-all duration-150 text-xs font-medium',
              isActive
                ? 'bg-primary-500 border-primary-500 text-white shadow-sm shadow-primary-200'
                : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
            )}
          >
            <span className="text-lg">{emoji}</span>
            <span>{getLabel(id)}</span>
          </button>
        )
      })}
    </div>
  )
}
