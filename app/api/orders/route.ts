import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const merchantId = searchParams.get('merchant_id')
  const status = searchParams.get('status')

  let query = supabase
    .from('orders')
    .select('*, client:users(name, phone), order_items(*, product:products(name))')
    .order('created_at', { ascending: false })

  if (merchantId) query = query.eq('merchant_id', merchantId)
  if (status) query = query.eq('status', status)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
