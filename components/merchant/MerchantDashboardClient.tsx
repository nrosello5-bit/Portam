'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, BellOff, ChevronDown, Phone, Power } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import type { Order, OrderStatus, Merchant } from '@/types'
import { ORDER_STATUS_LABELS } from '@/types'

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'accepted',
  accepted: 'preparing',
  preparing: 'picked_up',
}

const NEXT_LABELS: Partial<Record<OrderStatus, string>> = {
  pending: 'Acceptar comanda',
  accepted: 'Marcar com preparant',
  preparing: 'Llest per a recollir',
}

interface Props {
  merchant: Merchant
  initialOrders: (Order & { client: { name: string; phone: string }; order_items: any[] })[]
}

export default function MerchantDashboardClient({ merchant, initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders)
  const [isOpen, setIsOpen] = useState(merchant.is_open)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [togglingOpen, setTogglingOpen] = useState(false)
  const supabase = createClient()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const pendingOrders = orders.filter((o) => o.status === 'pending')
  const activeOrders = orders.filter((o) => ['accepted', 'preparing', 'picked_up'].includes(o.status))
  const doneOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status))
  const todayRevenue = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0)

  useEffect(() => {
    const channel = supabase
      .channel(`merchant:${merchant.id}:orders`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `merchant_id=eq.${merchant.id}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data } = await supabase
              .from('orders')
              .select('*, client:users(name, phone), order_items(*, product:products(name))')
              .eq('id', payload.new.id)
              .single()
            if (data) {
              setOrders((prev) => [data as any, ...prev])
              if (soundEnabled) playAlert()
            }
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o))
            )
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [merchant.id, soundEnabled, supabase])

  const playAlert = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/new-order.mp3')
    }
    audioRef.current.play().catch(() => {})
  }

  const toggleOpen = async () => {
    setTogglingOpen(true)
    const newValue = !isOpen
    await supabase
      .from('merchants')
      .update({ is_open: newValue })
      .eq('id', merchant.id)
    setIsOpen(newValue)
    setTogglingOpen(false)
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
  }

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Segur que vols cancel·lar aquesta comanda?')) return
    await updateOrderStatus(orderId, 'cancelled')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-500 pt-safe">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-white font-bold text-lg">{merchant.name}</h1>
              <p className="text-white/70 text-sm">Panel del comerç</p>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white"
            >
              {soundEnabled ? <Bell size={18} /> : <BellOff size={18} />}
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Pendents', value: pendingOrders.length, highlight: pendingOrders.length > 0 },
              { label: 'Actives', value: activeOrders.length, highlight: false },
              { label: 'Ingressos', value: formatPrice(todayRevenue), highlight: false },
            ].map(({ label, value, highlight }) => (
              <div
                key={label}
                className={cn(
                  'rounded-xl p-3 text-center',
                  highlight ? 'bg-white order-pulse' : 'bg-white/20'
                )}
              >
                <p className={cn('font-bold text-lg', highlight ? 'text-primary-600' : 'text-white')}>
                  {value}
                </p>
                <p className={cn('text-xs', highlight ? 'text-gray-600' : 'text-white/70')}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open/close toggle */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <button
          onClick={toggleOpen}
          disabled={togglingOpen}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors font-semibold text-sm',
            isOpen
              ? 'border-green-400 bg-green-50 text-green-700'
              : 'border-gray-300 bg-gray-50 text-gray-600'
          )}
        >
          <div className="flex items-center gap-2">
            <Power size={18} />
            <span>{isOpen ? 'Comerç obert' : 'Comerç tancat'}</span>
          </div>
          <span className={cn('text-xs px-2 py-1 rounded-full', isOpen ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600')}>
            {isOpen ? 'Acceptant comandes' : 'Tancat per als clients'}
          </span>
        </button>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Pending orders */}
        {pendingOrders.length > 0 && (
          <section>
            <h2 className="section-title mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping-slow" />
              Noves comandes ({pendingOrders.length})
            </h2>
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isNew
                  onAdvance={() => updateOrderStatus(order.id, NEXT_STATUS[order.status]!)}
                  onCancel={() => cancelOrder(order.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Active orders */}
        {activeOrders.length > 0 && (
          <section>
            <h2 className="section-title mb-3">Comandes actives</h2>
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isNew={false}
                  onAdvance={
                    NEXT_STATUS[order.status]
                      ? () => updateOrderStatus(order.id, NEXT_STATUS[order.status]!)
                      : undefined
                  }
                  onCancel={() => cancelOrder(order.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Done orders */}
        {doneOrders.length > 0 && (
          <section>
            <h2 className="section-title mb-3 text-gray-400">Completades avui</h2>
            <div className="space-y-2">
              {doneOrders.map((order) => (
                <div key={order.id} className="card p-3 flex items-center justify-between opacity-60">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {(order as any).client?.name} · #{order.id.slice(0, 6)}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatPrice(order.total)}</p>
                    <span className={cn('badge text-xs', ORDER_STATUS_LABELS[order.status].color)}>
                      {ORDER_STATUS_LABELS[order.status].ca}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {orders.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hi ha comandes avui</h3>
            <p className="text-gray-500 text-sm">Les noves comandes apareixeran aquí.</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface OrderCardProps {
  order: any
  isNew: boolean
  onAdvance?: () => void
  onCancel: () => void
}

function OrderCard({ order, isNew, onAdvance, onCancel }: OrderCardProps) {
  const [expanded, setExpanded] = useState(isNew)
  const statusConfig = ORDER_STATUS_LABELS[order.status as OrderStatus]

  return (
    <div className={cn('card overflow-hidden', isNew && 'border-yellow-300 order-pulse')}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-gray-900">
              {order.client?.name}
              {isNew && <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">NOU</span>}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary-600">{formatPrice(order.total)}</span>
            <ChevronDown
              size={16}
              className={cn('text-gray-400 transition-transform', expanded && 'rotate-180')}
            />
          </div>
        </div>
        <div className="mt-2">
          <span className={cn('badge', statusConfig.color)}>{statusConfig.ca}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Items */}
          <div className="py-3 space-y-1.5">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.quantity}× {item.product?.name}</span>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Address & notes */}
          <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1 mb-3">
            <p className="text-gray-500">📍 {order.address}</p>
            {order.notes && <p className="text-gray-500">📝 {order.notes}</p>}
            {order.client?.phone && (
              <a href={`tel:${order.client.phone}`} className="flex items-center gap-1 text-primary-600 font-medium">
                <Phone size={14} />
                {order.client.phone}
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {onAdvance && NEXT_LABELS[order.status as OrderStatus] && (
              <button
                onClick={onAdvance}
                className="flex-1 btn-primary text-sm py-2.5"
              >
                {NEXT_LABELS[order.status as OrderStatus]}
              </button>
            )}
            {(order.status === 'pending' || order.status === 'accepted') && (
              <button
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50"
              >
                Cancel·lar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
