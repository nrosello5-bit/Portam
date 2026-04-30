import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import OrderTrackingClient from '@/components/client/OrderTrackingClient'

interface PageProps {
  params: { orderId: string }
}

export default async function OrderPage({ params }: PageProps) {
  const supabase = createClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      merchant:merchants(id, name, address, logo_url),
      order_items(*, product:products(name, price))
    `)
    .eq('id', params.orderId)
    .single()

  if (!order) notFound()

  return <OrderTrackingClient initialOrder={order as any} />
}
