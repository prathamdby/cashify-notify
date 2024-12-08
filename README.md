# Cashify Notify

**Introduction**

cashify-notify is a project designed to monitor and notify users about product availability and price changes on Cashify. It leverages the power of Bun, a fast all-in-one JavaScript runtime, to fetch product data, filter based on specific criteria, and send notifications to users via Telegram.

**Installation and Running the Project**

To install the project dependencies, run the following command in your terminal:

```bash
bun install
```

To run the project, execute the following command:

```bash
bun run index.ts
```

**Environment Variables**

The project relies on the following environment variables:

- `CASHIFY_PRODUCT_URL`: The URL of the Cashify product page to monitor.
- `CASHIFY_TARGET_PRICE`: The target price for which to send special notifications.
- `TELEGRAM_BOT_TOKEN`: The token for the Telegram bot used for sending notifications.
- `TELEGRAM_CHAT_ID`: The chat ID of the Telegram chat where notifications will be sent.
- `TELEGRAM_TARGET_USERNAME`: The username of the Telegram user to mention in special notifications.
