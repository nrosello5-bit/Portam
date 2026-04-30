'use client'

import { useEffect, useState } from 'react'
import { Bike, MapPin, Phone, Power, Package, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

interface Props {
  riderId: string
  riderName: string
  initialOrders: (Order & { merchant: { name: string; address: string }; client: { name: string; phone: string } })[]
}

export default function RiderDashboardClient({ riderId, riderName, initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders)
  const [available, setAvailable] = useState(true)
  const supabase = createClient()

  const myOrders = orders.filter((o) => o.rider_id === riderId)
  const pendingPool = orders.filter(
    (o) => !o.rider_id && ['preparing', 'accepted'].includes(o.status) && available
  )

  useEffect(() => {
    const channel = supabase
      .channel(`rider:${riderId}:orders`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const { data } = await supabase
              .from('orders')
              .select('*, merchant:merchants(name, address, lat, lng), client:users(name, phone)')
              .eq('id', payload.new.id)
              .single()
            if (data) {
              setOrders((prev) => {
                const exists = prev.find((o) => o.id === data.id)
                if (exists) {
                  return prev.map((o) => (o.id === data.id ? (data as any) : o))
                }
                return [data as any, ...prev]
              })
            }
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [riderId, supabase])

  useEffect(() => {
    if (!available) return
    const interval = setInterval(async () => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await supabase.from('rider_locations').upsert({
          rider_id: riderId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          updated_at: new Date().toISOString(),
        })
      })
    }, 15000)
    return () => clearInterval(interval)
  }, [riderId, available, supabase])

  const acceptOrder = async (orderId: string) => {
    await supabase
      .from('orders')
      .update({ rider_id: riderId, status: 'picked_up' })
      .eq('id', orderId)
  }

  const markDelivered = async (orderId: string) => {
    await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', orderId)
    setOrders((prev) => prev.filter((o) => o.id !== orderId))
  }

  const todayDeliveries = myOrders.filter((o) => o.status === 'delivered').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-500 pt-safe">
        <div className="px-4 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-white font-bold text-lg">Hola, {riderName.split(' ')[0]}!</h1>
              <p className="text-white/70 text-sm">App del repartidor</p>
            </div>
            <Bike size={32} className="text-white/80" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-xl">{todayDeliveries}</p>
              <p className="text-white/70 text-xs">Lliuraments avui</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-xl">{myOrders.filter(o => o.status === 'picked_up').length}</p>
              <p className="text-white/70 text-xs">En curs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Availability toggle */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <button
          onClick={() => setAvailable(!available)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-colors',
            available
              ? 'border-green-400 bg-green-50 text-green-700'
              : 'border-gray-300 bg-gray-50 text-gray-600'
          )}
        >
          <div className="flex items-center gap-2">
            <Power size={18} />
            <span>{available ? 'Disponible' : 'No disponible'}</span>
          </div>
          <span className={cn(
            'text-xs px-2 py-1 rounded-full',
            available ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
          )}>
            {available ? 'Rebent comandes' : 'Fora de servei'}
          </span>
        </button>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* My active orders */}
        {myOrders.filter(o => o.status === 'picked_up').length > 0 && (
          <section>
            <h2 className="section-title mb-3">Les meves comandes actives</h2>
            <div className="space-y-3">
              {myOrders.filter(o => o.status === 'picked_up').map((order) => (
                <div key={order.id} className="card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{(order as any).merchant?.name}</p>
                      <p className="text-sm text-gray-500">Per a: {(order as any).client?.name}</p>
                    </div>
                    <span className="font-bold text-primary-600">{formatPrice(order.total)}</span>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-800 mb-3 flex items-start gap-2">
                    <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{order.address}</span>
                  </div>

                  {(order as any).client?.phone && (
                    <a
                      href={`tel:${(order as any).client.phone}`}
                      className="flex items-center gap-2 text-sm text-primary-600 font-medium mb-3"
                    >
                      <Phone size={16} />
                      {(order as any).client.phone}
                    </a>
                  )}

                  <button
                    onClick={() => markDelivered(order.id)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Marcar com lliurada
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Available orders pool */}
        {available && pendingPool.length > 0 && (
          <section>
            <h2 className="section-title mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-ping-slow" />
              Comandes disponibles
            </h2>
            <div className="space-y-3">
              {pendingPool.map((order) => (
                <div key={order.id} className="card p-4 border-2 border-primary-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{(order as any).merchant?.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} />
                        {order.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">{formatPrice(order.total)}</p>
                      <p className="text-xs text-gray-400">+ propina possible</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => acceptOrder(order.id)}
                      className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
                    >
                      <Package size={16} />
                      Acceptar comanda
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {available && pendingPool.length === 0 && myOrders.filter(o => o.status === 'picked_up').length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🛵</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Esperant comandes</h3>
            <p className="text-gray-500 text-sm">Quan hi hagi comandes disponibles, apareixeran aquí.</p>
          </div>
        )}
      </div>
    </div>
  )
}
