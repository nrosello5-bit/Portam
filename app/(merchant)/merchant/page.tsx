import { createClient } from '@/lib/supabase/server'
import { MOCK_MERCHANTS } from '@/lib/mock-data'
import MerchantDashboardClient from '@/components/merchant/MerchantDashboardClient'

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

// Comandes de demo per al panel merchant
const DEMO_ORDERS = [
  {
    id: 'demo-order-0001',
    client_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    merchant_id: 'merchant-pizza-0000-0000-000000000001',
    rider_id: null,
    status: 'pending' as const,
    total: 26.50,
    delivery_fee: 1.50,
    address: 'Carrer Sant Antoni, 8, 1r 2a, L\'Ametlla del Vallès',
    lat: null, lng: null,
    notes: 'Porta les estovalles de plàstic si pots, gràcies!',
    payment_method: 'card' as const,
    stripe_payment_intent_id: null,
    created_at: new Date(Date.now() - 3 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60000).toISOString(),
    client: { name: 'Maria García', phone: '+34 600 111 222' },
    order_items: [
      { id: 'oi1', order_id: 'demo-order-0001', product_id: 'p1', quantity: 2, price: 11.50, created_at: new Date().toISOString(), product: { name: 'Pizza Margherita' } },
      { id: 'oi2', order_id: 'demo-order-0001', product_id: 'p6', quantity: 2, price: 2.00, created_at: new Date().toISOString(), product: { name: 'Coca-Cola 33cl' } },
    ],
  },
  {
    id: 'demo-order-0002',
    client_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    merchant_id: 'merchant-pizza-0000-0000-000000000001',
    rider_id: null,
    status: 'preparing' as const,
    total: 19.00,
    delivery_fee: 1.50,
    address: 'Avinguda del Vallès, 45, Baixos, L\'Ametlla del Vallès',
    lat: null, lng: null,
    notes: null,
    payment_method: 'cash' as const,
    stripe_payment_intent_id: null,
    created_at: new Date(Date.now() - 18 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60000).toISOString(),
    client: { name: 'Pere Soler', phone: '+34 655 987 654' },
    order_items: [
      { id: 'oi3', order_id: 'demo-order-0002', product_id: 'p2', quantity: 1, price: 13.50, created_at: new Date().toISOString(), product: { name: 'Pizza Prosciutto' } },
      { id: 'oi4', order_id: 'demo-order-0002', product_id: 'p5', quantity: 1, price: 4.50, created_at: new Date().toISOString(), product: { name: 'Tiramisú casolà' } },
    ],
  },
  {
    id: 'demo-order-0003',
    client_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    merchant_id: 'merchant-pizza-0000-0000-000000000001',
    rider_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    status: 'delivered' as const,
    total: 17.00,
    delivery_fee: 1.50,
    address: 'Plaça de l\'Església, 3, L\'Ametlla del Vallès',
    lat: null, lng: null,
    notes: null,
    payment_method: 'card' as const,
    stripe_payment_intent_id: 'pi_demo_123',
    created_at: new Date(Date.now() - 90 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 60000).toISOString(),
    client: { name: 'Anna Puig', phone: '+34 620 333 111' },
    order_items: [
      { id: 'oi5', order_id: 'demo-order-0003', product_id: 'p3', quantity: 1, price: 14.00, created_at: new Date().toISOString(), product: { name: 'Pizza Quatre Formatges' } },
      { id: 'oi6', order_id: 'demo-order-0003', product_id: 'p6', quantity: 1, price: 2.00, created_at: new Date().toISOString(), product: { name: 'Coca-Cola 33cl' } },
    ],
  },
]

export default async function MerchantDashboardPage() {
  if (!SUPABASE_CONFIGURED) {
    // Mode demo
    const merchant = MOCK_MERCHANTS[0]
    return (
      <MerchantDashboardClient
        merchant={merchant as any}
        initialOrders={DEMO_ORDERS as any}
      />
    )
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const { redirect } = await import('next/navigation')
    redirect('/auth/login?redirect=/merchant')
  }

  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  if (!merchant) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div>
          <div className="text-5xl mb-4">🏪</div>
          <h2 className="text-xl font-bold mb-2">No tens cap comerç</h2>
          <p className="text-gray-500">Contacta l&apos;administrador per crear el teu comerç.</p>
        </div>
      </div>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: todayOrders } = await supabase
    .from('orders')
    .select('*, client:users(name, phone), order_items(*, product:products(name))')
    .eq('merchant_id', merchant.id)
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })

  return (
    <MerchantDashboardClient
      merchant={merchant as any}
      initialOrders={(todayOrders ?? []) as any}
    />
  )
}
