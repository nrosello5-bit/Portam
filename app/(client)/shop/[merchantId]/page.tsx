import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MerchantDetailClient from '@/components/client/MerchantDetailClient'
import { MOCK_MERCHANTS, MOCK_PRODUCTS } from '@/lib/mock-data'
import type { Merchant, Product } from '@/types'

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

interface PageProps {
  params: { merchantId: string }
}

export default async function MerchantPage({ params }: PageProps) {
  let merchant: Merchant | null = null
  let products: Product[] = []

  if (SUPABASE_CONFIGURED) {
    const supabase = createClient()
    const [{ data: m }, { data: p }] = await Promise.all([
      supabase.from('merchants').select('*').eq('id', params.merchantId).single(),
      supabase.from('products').select('*').eq('merchant_id', params.merchantId).order('category').order('name'),
    ])
    merchant = m as Merchant | null
    products = (p ?? []) as Product[]
  } else {
    merchant = MOCK_MERCHANTS.find((m) => m.id === params.merchantId) ?? null
    products = MOCK_PRODUCTS[params.merchantId] ?? []
  }

  if (!merchant) notFound()

  const categories = Array.from(new Set(products.map((p) => p.category)))

  return (
    <MerchantDetailClient
      merchant={merchant}
      products={products}
      categories={categories}
    />
  )
}
