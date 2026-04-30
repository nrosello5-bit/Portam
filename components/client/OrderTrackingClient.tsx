'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Clock, Package, Bike, Home, XCircle, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

const STATUS_STEPS: OrderStatus[] = ['pending', 'accepted', 'preparing', 'picked_up', 'delivered']

const STATUS_CONFIG: Record<OrderStatus, {
  icon: React.ReactNode
  label: string
  desc: string
  color: string
}> = {
  pending: {
    icon: <Clock size={24} />,
    label: 'Pendent de confirmació',
    desc: 'El comerç està revisant la teva comanda.',
    color: 'text-yellow-500',
  },
  accepted: {
    icon: <CheckCircle size={24} />,
    label: 'Comanda acceptada',
    desc: 'El comerç ha acceptat la teva comanda.',
    color: 'text-blue-500',
  },
  preparing: {
    icon: <Package size={24} />,
    label: 'Preparant la teva comanda',
    desc: 'Estan preparant els teus productes.',
    color: 'text-orange-500',
  },
  picked_up: {
    icon: <Bike size={24} />,
    label: 'El repartidor ve cap a tu',
    desc: 'El repartidor ha recollit la comanda.',
    color: 'text-purple-500',
  },
  delivered: {
    icon: <Home size={24} />,
    label: 'Comanda lliurada!',
    desc: 'Hem lliurat la teva comanda. Bon profit!',
    color: 'text-green-500',
  },
  cancelled: {
    icon: <XCircle size={24} />,
    label: 'Comanda cancel·lada',
    desc: 'La comanda ha estat cancel·lada.',
    color: 'text-red-500',
  },
}

interface Props {
  initialOrder: Order & { merchant: { name: string }; order_items: any[] }
}

export default function OrderTrackingClient({ initialOrder }: Props) {
  const [order, setOrder] = useState(initialOrder)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`order:${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          setOrder((prev) => ({ ...prev, ...payload.new }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [order.id, supabase])

  const config = STATUS_CONFIG[order.status]
  const currentStepIndex = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
          <ChevronLeft size={22} />
        </Link>
        <h1 className="font-bold text-gray-900">Seguiment de comanda</h1>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Status card */}
        <div className={cn('card p-6 text-center', order.status === 'delivered' && 'border-green-200 bg-green-50')}>
          <div className={cn('mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4',
            order.status === 'delivered' ? 'bg-green-100' : 'bg-gray-100'
          )}>
            <span className={config.color}>{config.icon}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{config.label}</h2>
          <p className="text-gray-500 text-sm">{config.desc}</p>

          {!isCancelled && order.status !== 'delivered' && (
            <div className="flex items-center justify-center gap-1.5 mt-3 text-sm text-gray-400">
              <Clock size={14} />
              <span>Temps estimat: 20–40 min</span>
            </div>
          )}
        </div>

        {/* Progress steps */}
        {!isCancelled && (
          <div className="card p-4">
            <div className="flex items-center">
              {STATUS_STEPS.map((step, index) => {
                const isDone = currentStepIndex >= index
                const isCurrent = currentStepIndex === index
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-500',
                        isDone ? 'bg-primary-500' : 'bg-gray-200',
                        isCurrent && 'ring-4 ring-primary-100'
                      )}
                    >
                      {isDone ? (
                        <CheckCircle size={16} className="text-white" />
                      ) : (
                        <span className="w-2 h-2 bg-gray-400 rounded-full" />
                      )}
                    </div>
                    {index < STATUS_STEPS.length - 1 && (
                      <div
                        className={cn(
                          'flex-1 h-1 transition-colors duration-500',
                          currentStepIndex > index ? 'bg-primary-500' : 'bg-gray-200'
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Order details */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Comanda de {(order as any).merchant?.name}
          </h3>
          <div className="space-y-2">
            {(order as any).order_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}× {item.product?.name}
                </span>
                <span className="font-medium text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatPrice(order.total - order.delivery_fee)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Enviament</span>
              <span>{formatPrice(order.delivery_fee)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span className="text-primary-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery address */}
        <div className="card p-4">
          <p className="text-sm font-semibold text-gray-900 mb-1">Adreça de lliurament</p>
          <p className="text-sm text-gray-500">{order.address}</p>
          {order.notes && (
            <>
              <p className="text-sm font-semibold text-gray-900 mb-1 mt-3">Notes</p>
              <p className="text-sm text-gray-500">{order.notes}</p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400">
          Comanda #{order.id.slice(0, 8).toUpperCase()} · {formatDate(order.created_at)}
        </p>
      </div>
    </div>
  )
}
