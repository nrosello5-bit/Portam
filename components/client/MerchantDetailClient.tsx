'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Clock, ShoppingBag, Plus, Minus, ChevronRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice, cn } from '@/lib/utils'
import CartFab from './CartFab'
import type { Merchant, Product } from '@/types'

interface Props {
  merchant: Merchant
  products: Product[]
  categories: string[]
}

export default function MerchantDetailClient({ merchant, products, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState(categories[0] ?? '')
  const { addItem, removeItem, getItemQuantity } = useCart()

  const productsByCategory = categories.reduce<Record<string, Product[]>>((acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Hero image */}
      <div className="relative h-52 bg-gray-200">
        {merchant.logo_url ? (
          <Image
            src={merchant.logo_url}
            alt={merchant.name}
            fill
            className="object-cover"
            sizes="640px"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full text-6xl bg-primary-50">🏪</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <Link
          href="/"
          className="absolute top-4 left-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md"
        >
          <ArrowLeft size={18} />
        </Link>
      </div>

      {/* Info card */}
      <div className="px-4 -mt-6 relative">
        <div className="card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{merchant.name}</h1>
              {merchant.description && (
                <p className="text-gray-500 text-sm mt-1">{merchant.description}</p>
              )}
            </div>
            <span
              className={cn(
                'flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full',
                merchant.is_open
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              )}
            >
              {merchant.is_open ? 'Obert' : 'Tancat'}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>20–40 min</span>
            </div>
            <span>·</span>
            <span>Enviament {formatPrice(merchant.delivery_fee)}</span>
            <span>·</span>
            <span>Mínim {formatPrice(merchant.min_order)}</span>
          </div>
        </div>
      </div>

      {!merchant.is_open && (
        <div className="mx-4 mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          ⚠️ Aquest comerç no accepta comandes en aquest moment.
        </div>
      )}

      {/* Category tabs */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10 mt-4">
        <div className="flex overflow-x-auto scrollbar-hide px-4 gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'flex-shrink-0 py-3 px-4 text-sm font-medium border-b-2 transition-colors',
                activeCategory === cat
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="px-4 mt-4 space-y-6">
        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="section-title mb-3">{cat}</h2>
            <div className="space-y-3">
              {productsByCategory[cat]?.map((product) => {
                const qty = getItemQuantity(product.id)
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={qty}
                    disabled={!merchant.is_open || !product.available}
                    onAdd={() => addItem(product, merchant.id, merchant.name)}
                    onRemove={() => removeItem(product.id)}
                  />
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <CartFab merchantName={merchant.name} />
    </div>
  )
}

interface ProductCardProps {
  product: Product
  quantity: number
  disabled: boolean
  onAdd: () => void
  onRemove: () => void
}

function ProductCard({ product, quantity, disabled, onAdd, onRemove }: ProductCardProps) {
  return (
    <div className={cn('card p-4 flex gap-3', disabled && 'opacity-60')}>
      {product.image_url && (
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="80px"
          />
          {!product.available && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-xs font-medium">Esgotat</span>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
        {product.description && (
          <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-primary-600">{formatPrice(product.price)}</span>

          {quantity === 0 ? (
            <button
              onClick={onAdd}
              disabled={disabled}
              className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white disabled:opacity-40 active:scale-95 transition-transform"
            >
              <Plus size={16} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onRemove}
                className="w-7 h-7 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
              >
                <Minus size={14} />
              </button>
              <span className="font-bold text-gray-900 w-4 text-center text-sm">{quantity}</span>
              <button
                onClick={onAdd}
                disabled={disabled}
                className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center text-white disabled:opacity-40 active:scale-95 transition-transform"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
