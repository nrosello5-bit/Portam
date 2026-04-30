import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export async function createPaymentIntent(amount: number, orderId: string) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'eur',
    metadata: { orderId },
    automatic_payment_methods: { enabled: true },
  })
  return paymentIntent
}
