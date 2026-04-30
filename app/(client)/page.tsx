import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import MerchantCard from '@/components/client/MerchantCard'
import CategoryFilter from '@/components/client/CategoryFilter'
import HomeHeader from '@/components/client/HomeHeader'
import { MOCK_MERCHANTS } from '@/lib/mock-data'
import type { Merchant, MerchantCategory } from '@/types'

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

interface HomePageProps {
  searchParams: { category?: string; q?: string }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const t = await getTranslations()

  let orderedMerchants: Merchant[] = []

  if (SUPABASE_CONFIGURED) {
    const supabase = createClient()
    let query = supabase
      .from('merchants')
      .select('*')
      .order('is_open', { ascending: false })
      .order('name')

    if (searchParams.category && searchParams.category !== 'all') {
      query = query.eq('category', searchParams.category)
    }
    if (searchParams.q) {
      query = query.ilike('name', `%${searchParams.q}%`)
    }

    const { data: merchants } = await query
    const open = (merchants ?? []).filter((m) => m.is_open)
    const closed = (merchants ?? []).filter((m) => !m.is_open)
    orderedMerchants = [...open, ...closed] as Merchant[]
  } else {
    // Mode demo: dades locals mentre Supabase no és configurat
    let filtered = MOCK_MERCHANTS
    if (searchParams.category && searchParams.category !== 'all') {
      filtered = filtered.filter((m) => m.category === searchParams.category)
    }
    if (searchParams.q) {
      const q = searchParams.q.toLowerCase()
      filtered = filtered.filter((m) => m.name.toLowerCase().includes(q))
    }
    const open = filtered.filter((m) => m.is_open)
    const closed = filtered.filter((m) => !m.is_open)
    orderedMerchants = [...open, ...closed]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      <div className="px-4 pt-4">
        <CategoryFilter selectedCategory={(searchParams.category as MerchantCategory) || 'all'} />
      </div>

      <main className="px-4 pb-6 mt-4">
        {orderedMerchants.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏪</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('home.noShops')}
            </h3>
            <p className="text-gray-500 text-sm">{t('home.noShopsDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orderedMerchants.map((merchant) => (
              <MerchantCard key={merchant.id} merchant={merchant} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
