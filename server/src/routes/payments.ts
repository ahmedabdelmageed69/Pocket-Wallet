import express, { Router } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../lib/auth";
import { HttpError } from "../lib/errors";
import { toCents } from "../lib/money";
import { creditTopUp } from "../services/wallet";

const stripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new HttpError(500, "Stripe is not configured");
  return new Stripe(key);
};

export const paymentsRouter = Router();

/** Step 1: the app asks for a PaymentIntent and shows Stripe's PaymentSheet. */
paymentsRouter.post("/topup-intent", requireAuth, express.json(), async (req, res, next) => {
  try {
    const { amount } = z.object({ amount: z.union([z.string(), z.number()]) }).parse(req.body);
    const cents = toCents(amount);
    const intent = await stripe().paymentIntents.create({
      amount: cents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { userId: (req as AuthedRequest).userId },
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (e) {
    next(e);
  }
});

/**
 * Step 2: Stripe calls this webhook when the payment really succeeded.
 * The wallet is credited here — never from the app — so it can't be faked.
 * Needs the raw body to verify Stripe's signature.
 */
paymentsRouter.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      req.body,
      req.header("stripe-signature") ?? "",
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch {
    return res.status(400).send("Bad signature");
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const userId = intent.metadata.userId;
    if (userId) {
      await creditTopUp(userId, intent.amount_received, intent.id);
      req.app.get("io")?.to(userId).emit("wallet:updated");
    }
  }
  res.json({ received: true });
});
