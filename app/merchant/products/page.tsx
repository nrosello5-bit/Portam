import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

export default async function MerchantProductsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/merchant/products')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/merchant')

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('category')
    .order('name')

  const byCategory = (products ?? []).reduce<Record<string, Product[]>>((acc, p) => {
    acc[p.category] = [...(acc[p.category] ?? []), p as Product]
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <h1 className="font-bold text-gray-900 text-lg">Productes</h1>
        <p className="text-sm text-gray-500">{merchant.name}</p>
      </div>

      <div className="px-4 py-4 space-y-6">
        {Object.entries(byCategory).map(([category, items]) => (
          <section key={category}>
            <h2 className="section-title mb-3">{category}</h2>
            <div className="space-y-2">
              {items.map((product) => (
                <div key={product.id} className="card p-4 flex items-center gap-3">
                  {product.image_url && (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="56px" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                    <p className="text-primary-600 font-semibold text-sm">{formatPrice(product.price)}</p>
                  </div>
                  <span className={`badge text-xs ${product.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {product.available ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}

        {(products ?? []).length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-500">No hi ha productes encara.</p>
          </div>
        )}
      </div>
    </div>
  )
}
