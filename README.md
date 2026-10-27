# Hono Shop: Project-Based Learning

Hono Shop is a hands-on learning project for exploring Hono by building a small online shop. Instead of studying framework features in isolation, the project connects them in a working application: Hono routes serve both JSON and HTML, middleware handles cross-cutting request concerns, Zod validates input, and Stripe Checkout handles payments.

The shop is intentionally small. Its focus is the application structure and the path a request takes through Hono, rather than production-scale commerce features.

## What You Can Learn

- Creating a Hono application and mounting route groups under path prefixes.
- Adding global and path-specific middleware for logging, timing, request IDs, security headers, CORS, and static files.
- Building JSON APIs and server-rendered pages with Hono JSX.
- Validating JSON and form data with Zod and `@hono/zod-validator`.
- Returning consistent HTTP errors from route handlers and application-level error handlers.
- Integrating Stripe Checkout, handling signed webhook events, and issuing authenticated refunds.
- Keeping application configuration in environment variables and validating it at startup.
- Separating routes, views, integrations, data, and state into small modules.

## Technology

- [Hono](https://hono.dev/) for routing, middleware, request handling, and JSX rendering.
- [Node.js](https://nodejs.org/) with `@hono/node-server` as the HTTP server adapter.
- [TypeScript](https://www.typescriptlang.org/) for typed application code.
- [Zod](https://zod.dev/) and `@hono/zod-validator` for request and environment validation.
- [Stripe](https://stripe.com/) for Checkout sessions, payment webhooks, and refunds.
- Plain CSS for the storefront.

## Project Structure

```text
.
├── public/
│   └── style.css            # Storefront styles served as a static asset
├── src/
│   ├── app.ts               # Hono app, middleware, route mounting, and error handlers
│   ├── index.ts             # Node server entry point
│   ├── env.ts               # Validated environment configuration
│   ├── data/
│   │   └── products.ts      # Example product catalog and product type
│   ├── lib/
│   │   ├── stripe.ts        # Stripe client and Checkout session creation
│   │   └── validate.ts      # Shared Zod request-validation helper
│   ├── middleware/
│   │   └── timing.ts        # Adds an X-Response-Time header
│   ├── routes/
│   │   ├── checkout.ts      # JSON endpoint for creating Checkout sessions
│   │   ├── orders.ts        # Order creation, lookup, and authenticated refunds
│   │   ├── pages.tsx        # Storefront, buy, success, and cancellation pages
│   │   ├── products.ts      # Product catalog API
│   │   └── webhook.ts       # Stripe webhook signature verification and updates
│   ├── store/
│   │   └── orders.ts        # Order types and in-memory order store
│   └── views/
│       ├── Layout.tsx       # Shared HTML document layout
│       ├── ProductList.tsx  # Product cards and purchase forms
│       └── Success.tsx      # Payment confirmation content
├── package.json             # Dependencies and development/build/start scripts
└── tsconfig.json            # TypeScript and Hono JSX compiler settings
```

## How a Purchase Works

1. The `GET /` page renders the product catalog using Hono JSX.
2. A purchase form posts a product ID and quantity to `POST /buy/:productId`.
3. The server validates the quantity, creates a pending order, and asks Stripe to create a Checkout session. The order ID is saved as Stripe session metadata.
4. The customer completes or cancels payment on Stripe and is redirected to `/success` or `/cancel`.
5. Stripe sends an event to `POST /webhook`. The application verifies the signature before marking an order paid or refunded.

The JSON API exposes the same product and order concepts for clients other than the HTML storefront.

## Routes

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/` | Render the shop page. |
| `POST` | `/buy/:productId` | Create an order from form data and redirect to Stripe Checkout. |
| `GET` | `/success?session_id=...` | Retrieve the Stripe session and render payment status. |
| `GET` | `/cancel` | Render the cancelled-payment page. |
| `GET` | `/api/products` | Return all products; optionally filter with `?category=apparel`. |
| `GET` | `/api/products/:id` | Return one product. |
| `POST` | `/api/orders` | Create a pending order from JSON. |
| `GET` | `/api/orders/:id` | Return one order. |
| `POST` | `/api/orders/:id/refund` | Refund a paid order; requires the admin bearer token. |
| `POST` | `/api/checkout` | Create a Stripe Checkout session for an existing pending order. |
| `POST` | `/webhook` | Receive and verify Stripe events. |

Create an order with JSON like:

```json
{
	"productId": "hoodie",
	"quantity": 1
}
```

The API responds with the new order, including its generated `id`. Send that ID to `POST /api/checkout` as `{ "orderId": "..." }` to receive the Stripe Checkout URL. Quantities must be integers from 1 to 10. Product prices are stored as integer cents.

## Setup

Use a recent Node.js release and npm. Install the dependencies:

```sh
npm ci
```

Create a `.env` file in the project root for local development:

```dotenv
APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
ADMIN_TOKEN=replace_with_at_least_16_characters
```

`APP_URL` is the public base URL used for Stripe return URLs. Use Stripe test-mode credentials while developing. The secret key must start with `sk_`, the webhook secret with `whsec_`, and the admin token must contain at least 16 characters. Keep real credentials out of version control.

Start the development server:

```sh
npm run dev
```

The app listens on port `3000` by default. Set `PORT` to use another port and update `APP_URL` to match. For local webhook testing, run the Stripe CLI in a separate terminal and forward events to `http://localhost:3000/webhook`; use the signing secret printed by the CLI as `STRIPE_WEBHOOK_SECRET`.

Build and run the compiled application with:

```sh
npm run build
npm start
```

The development script loads `.env` through `tsx`. The production `start` script does not load that file, so provide the required variables through the deployment environment.

## Application Notes

- Orders are held in a process-local `Map`; they are lost when the server restarts and are not shared across instances. This keeps the example focused on Hono and the payment flow, not database design.
- Stripe configuration is parsed when the application imports `src/env.ts`. Missing or malformed required settings prevent startup.
- The refund endpoint uses `Authorization: Bearer <ADMIN_TOKEN>`. Only paid orders with a recorded payment intent can be refunded.
- The webhook endpoint handles `checkout.session.completed` and `charge.refunded`. Stripe must be configured to deliver events to `/webhook` for payment state to stay current.
- The static file is `public/style.css`, while the shared layout currently requests `/public/styles.css`. Align one of these paths if the stylesheet does not load.
- `package.json` currently defines development, build, and start scripts; it does not define an automated test script.
