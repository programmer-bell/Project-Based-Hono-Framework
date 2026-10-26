
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import products from './routes/products'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const api = new Hono().basePath('/api')
api.route('/products', products)

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
