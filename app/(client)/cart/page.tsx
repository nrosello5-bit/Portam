'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Minus, Plus, Trash2, MapPin, CreditCard, Banknote } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, cn } from '@/lib/utils'
import type { PaymentMethod } from '@/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ─── Formulari de pagament amb Stripe ────────────────────────────────────────
function StripePaymentForm({
  clientSecret,
  onSuccess,
  onCancel,
  total,
}: {
  clientSecret: string
  onSuccess: () => void
  onCancel: () => void
  total: number
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/confirmed`,
      },
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Error en el pagament')
      setLoading(false)
      return
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="card p-4">
        <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <CreditCard size={16} className="text-primary-500" />
          Dades de la targeta
        </p>
        <PaymentElement
          options={{
            layout: 'tabs',
            wallets: { applePay: 'auto', googlePay: 'auto' },
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-primary w-full"
      >
        {loading ? 'Processant...' : `Pagar ${formatPrice(total)}`}
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Tornar enrere
      </button>
    </form>
  )
}

// ─── Pàgina principal de la cistella ─────────────────────────────────────────
export default function CartPage() {
  const router = useRouter()
  const { cart, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart()
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)

  const supabase = createClient()

  // Delivery fee hardcoded to 1.50 as fallback; real fee loaded on checkout
  const total = subtotal + 1.5

  const handleCheckout = async () => {
    if (!address.trim()) {
      setError("Cal introduir l'adreça de lliurament.")
      return
    }
    if (!cart.merchantId) return

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?redirect=/cart')
        return
      }

      // Fetch real delivery fee & min order
      const { data: merchant } = await supabase
        .from('merchants')
        .select('delivery_fee, min_order')
        .eq('id', cart.merchantId)
        .single()

      if (!merchant) throw new Error('Comerç no trobat')

      if (subtotal < merchant.min_order) {
        setError(`La comanda mínima és de ${formatPrice(merchant.min_order)}`)
        return
      }

      const orderTotal = subtotal + merchant.delivery_fee

      // Create order in DB (status pending)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          client_id: user.id,
          merchant_id: cart.merchantId,
          status: 'pending',
          total: orderTotal,
          delivery_fee: merchant.delivery_fee,
          address: address.trim(),
          notes: notes.trim() || null,
          payment_method: paymentMethod,
        })
        .select()
        .single()

      if (orderError || !order) throw orderError ?? new Error('Error creant comanda')

      // Insert order items
      await supabase.from('order_items').insert(
        cart.items.map((item) => ({
          order_id: order.id,
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        }))
      )

      if (paymentMethod === 'cash') {
        // Cash: go straight to tracking
        clearCart()
        router.push(`/order/${order.id}`)
        return
      }

      // Card: get Stripe client secret
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, amount: orderTotal }),
      })

      if (!res.ok) throw new Error('Error iniciant el pagament')

      const { clientSecret: secret } = await res.json()
      setPendingOrderId(order.id)
      setClientSecret(secret)
    } catch (err) {
      console.error(err)
      setError("No s'ha pogut crear la comanda. Torna-ho a intentar.")
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    clearCart()
    router.push(`/order/${pendingOrderId}`)
  }

  const handlePaymentCancel = () => {
    setClientSecret(null)
    setPendingOrderId(null)
  }

  // ── Empty cart ───────────────────────────────────────────────────────────
  if (itemCount === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">La cistella és buida</h2>
        <p className="text-gray-500 mb-6">Afegeix productes d&apos;un comerç per continuar.</p>
        <Link href="/" className="btn-primary">Veure comerços</Link>
      </div>
    )
  }

  // ── Stripe payment step ──────────────────────────────────────────────────
  if (clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={handlePaymentCancel}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-gray-900 text-lg">Pagament</h1>
        </div>
        <div className="px-4 py-4">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: { colorPrimary: '#E35B2A' },
              },
              locale: 'es',
            }}
          >
            <StripePaymentForm
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
              total={subtotal + 1.5}
            />
          </Elements>
        </div>
      </div>
    )
  }

  // ── Main cart view ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-gray-900 text-lg">La teva cistella</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Merchant */}
        <div className="card p-4">
          <p className="text-sm text-gray-500">Comanda de</p>
          <p className="font-bold text-gray-900">{cart.merchantName}</p>
        </div>

        {/* Items */}
        <div className="card divide-y divide-gray-100">
          {cart.items.map(({ product, quantity }) => (
            <div key={product.id} className="flex items-center gap-3 p-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                <p className="text-primary-600 font-semibold text-sm">{formatPrice(product.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-7 h-7 border border-gray-200 rounded-full flex items-center justify-center text-gray-600"
                >
                  {quantity === 1
                    ? <Trash2 size={13} className="text-red-400" />
                    : <Minus size={13} />}
                </button>
                <span className="font-bold text-gray-900 w-5 text-center text-sm">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center text-white"
                >
                  <Plus size={13} />
                </button>
              </div>
              <span className="font-semibold text-gray-900 text-sm w-16 text-right">
                {formatPrice(product.price * quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Address */}
        <div className="card p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            <MapPin size={16} className="inline mr-1 text-primary-500" />
            Adreça de lliurament
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Carrer, número, pis..."
            className="input text-sm"
          />
        </div>

        {/* Notes */}
        <div className="card p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Notes (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instruccions d'accés, al·lèrgies..."
            rows={2}
            className="input text-sm resize-none"
          />
        </div>

        {/* Payment method */}
        <div className="card p-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">Mètode de pagament</p>
          <div className="space-y-2">
            {([
              { value: 'card', icon: CreditCard, label: 'Targeta bancària' },
              { value: 'cash', icon: Banknote, label: 'Efectiu al lliurament' },
            ] as const).map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setPaymentMethod(value)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors text-sm',
                  paymentMethod === value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-700'
                )}
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
                {paymentMethod === value && (
                  <span className="ml-auto w-4 h-4 bg-primary-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="card p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Enviament</span>
            <span>{formatPrice(1.5)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
            <span>Total</span>
            <span className="text-primary-600">{formatPrice(total)}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="btn-primary w-full text-center"
        >
          {loading
            ? 'Processant...'
            : paymentMethod === 'card'
            ? `Pagar amb targeta · ${formatPrice(total)}`
            : `Confirmar comanda · ${formatPrice(total)}`}
        </button>
      </div>
    </div>
  )
}
