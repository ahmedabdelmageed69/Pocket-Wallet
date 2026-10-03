import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../lib/auth";
import { withIdempotency } from "../lib/idempotency";
import { toCents } from "../lib/money";
import { prisma } from "../lib/prisma";
import { getWallet, transfer } from "../services/wallet";

export const walletRouter = Router();
walletRouter.use(requireAuth);

walletRouter.get("/", async (req, res, next) => {
  try {
    const wallet = await getWallet((req as AuthedRequest).userId);
    res.json({ balance: wallet.balance, currency: wallet.currency });
  } catch (e) {
    next(e);
  }
});

walletRouter.get("/transactions", async (req, res, next) => {
  try {
    const wallet = await getWallet((req as AuthedRequest).userId);
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
    const items = await prisma.ledgerEntry.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      take: 21,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const hasMore = items.length > 20;
    const page = items.slice(0, 20);
    res.json({ items: page, nextCursor: hasMore ? page[page.length - 1].id : null });
  } catch (e) {
    next(e);
  }
});

const transferSchema = z.object({ toEmail: z.string().email(), amount: z.union([z.string(), z.number()]) });

walletRouter.post("/transfer", async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).userId;
    const { toEmail, amount } = transferSchema.parse(req.body);
    const cents = toCents(amount);
    const result = await withIdempotency(req.header("Idempotency-Key"), userId, async () => {
      const r = await transfer(userId, toEmail, cents);
      req.app.get("io")?.to(r.receiverUserId).emit("wallet:updated");
      return { reference: r.reference, balance: r.balance };
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});
