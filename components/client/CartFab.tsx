'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'

interface CartFabProps {
  merchantName: string
}

export default function CartFab({ merchantName }: CartFabProps) {
  const { itemCount, subtotal, cart } = useCart()

  if (itemCount === 0 || cart.merchantName !== merchantName) return null

  return (
    <div className="fixed bottom-6 left-4 right-4 z-40 animate-slide-up">
      <Link href="/cart">
        <div className="bg-primary-500 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-primary-200 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl w-9 h-9 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
            <span className="font-semibold">
              {itemCount} article{itemCount !== 1 ? 's' : ''}
            </span>
          </div>
          <span className="font-bold text-lg">{formatPrice(subtotal)}</span>
        </div>
      </Link>
    </div>
  )
}
