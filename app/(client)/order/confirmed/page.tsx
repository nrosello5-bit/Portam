'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

export default function OrderConfirmedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [seconds, setSeconds] = useState(5)

  const paymentIntent = searchParams.get('payment_intent')

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(t)
          router.push('/')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-gray-50">
      <div className="card p-8 max-w-sm w-full">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagament confirmat!</h1>
        <p className="text-gray-500 mb-6">
          La teva comanda s&apos;ha processat correctament.
        </p>
        {paymentIntent && (
          <p className="text-xs text-gray-400 mb-4 font-mono break-all">
            Ref: {paymentIntent}
          </p>
        )}
        <p className="text-sm text-gray-400">
          Redirigint en {seconds}s…
        </p>
        <button
          onClick={() => router.push('/')}
          className="btn-primary w-full mt-4"
        >
          Tornar a l&apos;inici
        </button>
      </div>
    </div>
  )
}
