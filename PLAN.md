# Pocket Wallet — portfolio project plan

A small, production-style **wallet & payments app**: React Native (Expo) client, Node/Express API, PostgreSQL, Stripe (test mode).
Goal: a public GitHub repo + demo video that proves end-to-end skills recruiters asked about (payments, backend, real-time, testing).

## Features

| # | Feature | What it shows |
|---|---------|---------------|
| 1 | Sign up / log in (JWT, bcrypt), token in SecureStore, Face ID unlock | Auth, mobile security |
| 2 | Wallet balance + transaction history (paginated) | API design, React Query |
| 3 | Top up with card — Stripe PaymentSheet, credited **only** by webhook | Real payment flow, idempotency |
| 4 | Send money to another user by email — atomic, can't overdraw, idempotency key | DB transactions, correctness |
| 5 | Real-time "you received money" (Socket.IO) + push notification | Real-time |
| 6 | Arabic / English with RTL | Localization |
| 7 | Tests: API (Vitest + Supertest), app (Jest + RNTL), CI on GitHub Actions | Quality |

## Architecture

```
app/  (Expo Router, TypeScript)
  React Query  →  REST API  ←  Stripe webhooks
  Zustand + SecureStore (token)
server/ (Express, TypeScript, Prisma)
  users ─┬─ wallets (balance in cents)
         └─ ledger entries (every money movement, double-entry style)
  PostgreSQL (docker-compose)
```

Money rules (talk about these in interviews):
- All amounts are **integers in cents** — never floats.
- Balance changes only inside a DB transaction that also writes a ledger entry.
- Transfers use a conditional update (`balance >= amount`) so two parallel requests can't overdraw.
- Every write endpoint accepts an `Idempotency-Key`; retries return the original result.
- Top-ups are credited from the **webhook** (`payment_intent.succeeded`), not from the app, so a user can't fake a payment.

## Milestones (≈ 2–3 weeks of evenings)

1. **Week 1:** server auth + wallet + transfer + tests; app login, home, history. ← *starter code covers this*
2. **Week 2:** Stripe top-up (PaymentSheet + webhook), send-money screen, Face ID, i18n/RTL, Socket.IO live updates. ← *done in starter code; test on device*
3. **Week 3:** push notifications, integration tests with a test Postgres, CI, README with GIFs, deploy API (Render/Railway) + Expo preview build, 60-sec demo video.

## When it's done
- Pin the repo on GitHub (ahmedabdelmageed69), add it to megoo.me and the CV "Selected Projects".
- Use it in interviews: "walk me through how you prevent double-spend."
