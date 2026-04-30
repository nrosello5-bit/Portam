import Image from 'next/image'
import Link from 'next/link'
import { Clock, Star, ChevronRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { MERCHANT_CATEGORY_LABELS } from '@/types'
import type { Merchant } from '@/types'
import { cn } from '@/lib/utils'

interface MerchantCardProps {
  merchant: Merchant
}

export default function MerchantCard({ merchant }: MerchantCardProps) {
  const categoryInfo = MERCHANT_CATEGORY_LABELS[merchant.category] ?? {
    ca: merchant.category,
    es: merchant.category,
    emoji: '📦',
  }

  return (
    <Link href={`/shop/${merchant.id}`} className="block">
      <div
        className={cn(
          'card overflow-hidden transition-all duration-150 hover:shadow-md active:scale-[0.99]',
          !merchant.is_open && 'opacity-70'
        )}
      >
        <div className="relative h-36 bg-gray-100">
          {merchant.logo_url ? (
            <Image
              src={merchant.logo_url}
              alt={merchant.name}
              fill
              className={cn('object-cover', !merchant.is_open && 'grayscale')}
              sizes="(max-width: 640px) 100vw, 640px"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-5xl">
              {categoryInfo.emoji}
            </div>
          )}

          {!merchant.is_open && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="bg-black/70 text-white text-sm font-medium px-3 py-1 rounded-full">
                Tancat
              </span>
            </div>
          )}

          {merchant.is_open && (
            <div className="absolute top-3 left-3">
              <span className="bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                Obert
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base truncate">{merchant.name}</h3>
              <p className="text-gray-500 text-sm mt-0.5">
                {categoryInfo.emoji} {categoryInfo.ca}
              </p>
            </div>
            <ChevronRight size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
          </div>

          {merchant.description && (
            <p className="text-gray-500 text-sm mt-2 line-clamp-1">{merchant.description}</p>
          )}

          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Clock size={14} />
              <span>20–40 min</span>
            </div>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">
              {merchant.delivery_fee === 0
                ? 'Enviament gratuït'
                : `Enviament ${formatPrice(merchant.delivery_fee)}`}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">
              Mínim {formatPrice(merchant.min_order)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
