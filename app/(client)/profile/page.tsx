'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Package, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatPrice } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/types'
import type { Order } from '@/types'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: orders } = await supabase
        .from('orders')
        .select('*, merchant:merchants(name)')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setUser(profile)
      setOrders((orders ?? []) as Order[])
      setLoading(false)
    }
    loadData()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-500 pt-safe px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <User size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">{user?.name}</h1>
            <p className="text-white/70 text-sm">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {orders.length > 0 && (
          <div className="card p-4">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package size={18} className="text-primary-500" />
              Les meves comandes
            </h2>
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/order/${order.id}`}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {(order as any).merchant?.name}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                    <span className={`badge text-xs ${ORDER_STATUS_LABELS[order.status].color}`}>
                      {ORDER_STATUS_LABELS[order.status].ca}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50"
        >
          <LogOut size={18} />
          Tancar sessió
        </button>
      </div>
    </div>
  )
}
