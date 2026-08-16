# MaterialQ

MaterialQ is a bilingual beta dashboard for raw material procurement intelligence.

## What it does

- Collects procurement parameters: product, quantity, delivery date, location, distance, and recipient email.
- Presents a modern industrial dashboard for supplier diagnosis.
- Runs the first backend scoring flow for quality, price, risk, and stock.
- Prepares report, email, and Telegram actions behind human confirmation.
- Is structured so Exa, Notion, and Composio are owned by the backend instead of the browser.

## Integrations planned

- Exa: open web research and source citations.
- Notion: analysis history, email-based memory, suppliers, reports, and decisions.
- Composio: email, Drive, Telegram, and future connected apps.
- Telegram: bot-based questions through `@circulo67_bot`.

## Run locally

Run:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Configure Exa

Create a local `.env` file from `.env.example`:

```bash
copy .env.example .env
```

Add your Exa API key:

```text
EXA_API_KEY=your_exa_key_here
```

Restart the server. You can check integration state at:

```text
http://localhost:3000/api/health
```

## Configure Notion memory

Create a Notion integration, copy its internal integration token, and share your MaterialQ database with that integration.

Add these values to `.env`:

```text
NOTION_TOKEN=secret_your_notion_token
NOTION_DATABASE_ID=your_database_id
```

The first version expects these database properties:

```text
Name: Title
Product: Text
Quantity: Text
Delivery Date: Date
Location: Text
Distance: Text
Email: Email
Risk: Select
Stock: Select
Quality: Number
Price: Number
Recommendation: Text
Top Supplier: Text
Source URL: URL
Analysis ID: Text
```

When Notion is configured, every `/api/analyze` result is saved as a Notion page with recommendation, evaluated suppliers, discarded options, and next steps.

The client history can be queried by email:

```bash
curl -X POST http://localhost:3000/api/history/request-pin \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"compras@empresa.com\"}"
```

Then verify the PIN and use the returned `accessToken` to load history:

```bash
curl -X POST http://localhost:3000/api/history/verify-pin \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"compras@empresa.com\",\"pin\":\"123456\"}"
```

```bash
curl -X POST http://localhost:3000/api/history \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"compras@empresa.com\",\"accessToken\":\"token_from_verify\",\"limit\":10}"
```

Without `COMPOSIO_API_KEY`, local development prints the PIN in the server console instead of emailing it. Production should send the PIN by email and never expose it in UI responses.

## Configure Composio Gmail

MaterialQ uses Composio to send report emails and history PINs through Gmail.

Add these values to `.env`:

```text
COMPOSIO_API_KEY=your_composio_project_api_key
COMPOSIO_USER_ID=default
```

The Gmail account must be connected in Composio for the same user id. The backend sends emails with the `GMAIL_SEND_EMAIL` tool.

## Test Telegram answers locally

The bot answer engine is exposed through the backend so it can be called by a webhook, Composio runner, or local test:

```bash
curl -X POST http://localhost:3000/api/telegram/answer \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"qué datos necesitas\"}"
```

For a purchase analysis, send a complete buying request:

```bash
curl -X POST http://localhost:3000/api/telegram/answer \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"analiza acero inoxidable 304, 500 kg, entrega 2026-09-15, ubicación Guadalajara, distancia 350 km, correo compras@empresa.com\"}"
```

## Deploy later

The frontend and backend can be deployed later to Vercel, Cloudflare, Replit, or another Node-compatible host. Keep API keys in environment variables on the host, never in `app.js` or `index.html`.
