import { Hono } from 'hono'
import { products } from '../data/product'

const app = new Hono()

app.get("/", (c) => {
  const category = c.req.query('category')
  if (category) {
    return c.json(products.filter((p) => p.category === category))
  }
  return c.json(products)
})

app.get("/:id", (c) => {
  const id = c.req.param('id')
  const product = products.find((p) => p.id === id)

  if (!product) {
    return c.json({ error: 'Product not found' }, 404)
  }

  return c.json(product)
})

export default app