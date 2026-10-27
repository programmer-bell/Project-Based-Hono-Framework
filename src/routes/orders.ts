import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { products } from '../data/product.js'
import { orders, type Order } from '../store/orders.js'

const createOrderSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
})

const app = new Hono()

app.post("/", zValidator("json", createOrderSchema), (c) => {
    const { productId, quantity } = c.req.valid("json")
    const product = products.find( (p) => p.id === productId )
    if(!product) {
        throw new HTTPException(404, { message: "Product not found" })
    }

    const order: Order = {
        id: crypto.randomUUID(),
        productId: product.id,
        quantity: quantity,
        amount: product.price * quantity,
        status: "pending",
    }
    orders.set(order.id, order)
    return c.json(order, 201)
})

app.get("/:id", (c) => {
    const { id } = c.req.param()
    const order = orders.get(id)
    if(!order) {
        throw new HTTPException(404, { message: "Order not found" })
    }
    return c.json(order)
})

export default app