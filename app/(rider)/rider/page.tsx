import { createClient } from '@/lib/supabase/server'
import RiderDashboardClient from '@/components/rider/RiderDashboardClient'

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

const DEMO_RIDER_ORDERS = [
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
    merchant: { name: 'Pizzeria La Plaça', address: 'Plaça de la Vila, 5' },
    client: { name: 'Pere Soler', phone: '+34 655 987 654' },
  },
  {
    id: 'demo-order-0004',
    client_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    merchant_id: 'merchant-farma-0000-0000-000000000002',
    rider_id: null,
    status: 'accepted' as const,
    total: 16.40,
    delivery_fee: 2.00,
    address: 'Carrer de la Pau, 12, 2n 1a, L\'Ametlla del Vallès',
    lat: null, lng: null,
    notes: 'El timbre no funciona, trucar al mòbil',
    payment_method: 'card' as const,
    stripe_payment_intent_id: null,
    created_at: new Date(Date.now() - 8 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60000).toISOString(),
    merchant: { name: 'Farmàcia Central', address: 'Carrer Major, 12' },
    client: { name: 'Lluís Mas', phone: '+34 677 444 222' },
  },
]

export default async function RiderPage() {
  if (!SUPABASE_CONFIGURED) {
    return (
      <RiderDashboardClient
        riderId="demo-rider-id"
        riderName="Pau Rovira"
        initialOrders={DEMO_RIDER_ORDERS as any}
      />
    )
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const { redirect } = await import('next/navigation')
    redirect('/auth/login?redirect=/rider')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role, name')
    .eq('id', user!.id)
    .single()

  if (profile?.role !== 'rider') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div>
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-bold mb-2">Accés no autoritzat</h2>
          <p className="text-gray-500">Aquesta secció és només per a repartidors.</p>
        </div>
      </div>
    )
  }

  const { data: activeOrders } = await supabase
    .from('orders')
    .select('*, merchant:merchants(name, address, lat, lng), client:users(name, phone)')
    .in('status', ['pending', 'accepted', 'preparing', 'picked_up'])
    .or(`rider_id.eq.${user!.id},rider_id.is.null`)
    .order('created_at', { ascending: false })

  return (
    <RiderDashboardClient
      riderId={user!.id}
      riderName={profile.name}
      initialOrders={(activeOrders ?? []) as any}
    />
  )
}
