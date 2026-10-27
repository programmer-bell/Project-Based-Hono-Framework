// Centralizes Stripe Checkout setup so the web page and JSON API share behavior.
import Stripe from 'stripe'
import { env } from '../env.js'
import { products } from '../data/products.js'
import type { Order } from '../store/orders.js'

export const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export async function createCheckoutSession(order: Order) {
  const product = products.find((p) => p.id === order.productId)!

  // The order ID links webhook events back to local state; the key prevents duplicate sessions.
  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      line_items: [
        {
          quantity: order.quantity,
          price_data: {
            currency: 'usd',
            unit_amount: product.price,
            product_data: { name: product.name },
          },
        },
      ],
      metadata: { orderId: order.id },
      success_url: `${env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/cancel`,
    },
    { idempotencyKey: `checkout-${order.id}` },
  )

  order.sessionId = session.id
  return session
}