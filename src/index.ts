
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import products from './routes/products.js'
import orders from './routes/orders.js'

const app = new Hono()

app.use(logger()) 
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const api = new Hono().basePath('/api')
api.route('/products', products)
api.route("/orders", orders)

app.route('/', api)

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)
