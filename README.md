# Pocket Wallet

A wallet & payments app: **React Native (Expo Router, TypeScript)** + **Node/Express + PostgreSQL (Prisma)** + **Stripe**.

Sign up, top up with a card (Stripe PaymentSheet), send money to other users by email, and see your history.

## Why it's built this way
- **Money as integer cents** – no floating-point errors.
- **Atomic transfers** – debit, credit and two ledger entries in one DB transaction.
- **No overdraft under races** – conditional update `balance >= amount`.
- **Idempotency keys** – a retried request never sends money twice.
- **Webhook-credited top-ups** – the wallet is credited only when Stripe confirms the payment, never by the app.
- **Live updates** – Socket.IO pushes `wallet:updated` the moment money arrives (transfer or Stripe webhook).
- **Arabic / English with RTL** – switch language from the login or home screen.
- **Biometric confirm** – Face ID / fingerprint before every transfer; session in SecureStore.

## Run it

```bash
# 1. Database
docker compose up -d

# 2. API
cd server
cp .env.example .env          # add your Stripe test keys
npm install
npx prisma migrate dev --name init
npm run dev                   # http://localhost:4000
npm test

# 3. Stripe webhook (another terminal)
stripe listen --forward-to localhost:4000/payments/webhook   # copy whsec_... into .env

# 4. App
cd ../app
npm install
# set extra.apiUrl and extra.stripePublishableKey in app.json
npx expo run:ios   # or run:android (Stripe needs a dev build, not Expo Go)
```

Test card: `4242 4242 4242 4242`, any future date, any CVC.

## API
| Method | Path | Notes |
|---|---|---|
| POST | /auth/register | name, email, password |
| POST | /auth/login | returns JWT |
| GET | /auth/me | |
| GET | /wallet | balance in cents |
| GET | /wallet/transactions?cursor= | 20 per page |
| POST | /wallet/transfer | `{ toEmail, amount }`, header `Idempotency-Key` |
| POST | /payments/topup-intent | `{ amount }` → Stripe client secret |
| POST | /payments/webhook | Stripe → credits wallet |

## Roadmap
See [PLAN.md](PLAN.md): push notifications, more tests, deploy, demo video.
