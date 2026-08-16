# MaterialQ Telegram Poller

The current Telegram connection is managed by Composio inside Codex. The app can answer messages when a runner polls Telegram updates, sends each user message to `src/agent/telegram-agent.js`, and replies through `TELEGRAM_SEND_MESSAGE`.

Production options:

- Use Composio webhooks or a scheduled worker when available.
- Use Telegram Bot API directly if the bot token is stored in server environment variables.
- Keep only one polling consumer active to avoid Telegram `409 Conflict`.

Message format supported by the beta parser:

```text
analiza acero inoxidable 304, 500 kg, entrega 2026-09-15, ubicación Guadalajara, distancia 350 km, correo compras@empresa.com
```
