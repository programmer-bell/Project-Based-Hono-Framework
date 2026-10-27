import { Hono } from 'hono'
import { products } from '../data/product.js';
import { orders, type Order } from '../store/orders.js';

const app = new Hono()

app.post("/", async(c) => {
    const body = await c.req.json()
    const product = products.find( (p) => p.id === body.productId )
    if(!product) {
        return c.json({ message: "Product not found"}, 404)
    }

    const order: Order = {
        id: crypto.randomUUID(),
        productId: product.id,
        quantity: body.quantity,
        amount: product.price * body.quantity,
        status: "pending",
    }
    orders.set(order.id, order)
    return c.json(order, 201)
})

export default app