import { randomUUID } from "crypto";
import { HttpError } from "../lib/errors";
import { prisma } from "../lib/prisma";

export async function getWallet(userId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new HttpError(404, "Wallet not found");
  return wallet;
}

/**
 * Moves money between two wallets atomically.
 * The conditional updateMany (balance >= amount) is the overdraft guard:
 * if two transfers race, only one can match the condition.
 */
export async function transfer(fromUserId: string, toEmail: string, amount: number) {
  return prisma.$transaction(async (tx) => {
    const sender = await tx.wallet.findUnique({
      where: { userId: fromUserId },
      include: { user: true },
    });
    if (!sender) throw new HttpError(404, "Wallet not found");

    const receiver = await tx.user.findUnique({
      where: { email: toEmail.toLowerCase() },
      include: { wallet: true },
    });
    if (!receiver?.wallet) throw new HttpError(404, "No user with that email");
    if (receiver.id === fromUserId) throw new HttpError(400, "You can't send money to yourself");

    const debited = await tx.wallet.updateMany({
      where: { id: sender.id, balance: { gte: amount } },
      data: { balance: { decrement: amount } },
    });
    if (debited.count === 0) throw new HttpError(400, "Insufficient balance");

    const credited = await tx.wallet.update({
      where: { id: receiver.wallet.id },
      data: { balance: { increment: amount } },
    });
    const senderAfter = await tx.wallet.findUniqueOrThrow({ where: { id: sender.id } });

    const reference = randomUUID();
    await tx.ledgerEntry.createMany({
      data: [
        {
          walletId: sender.id,
          type: "TRANSFER_OUT",
          amount,
          balanceAfter: senderAfter.balance,
          counterparty: receiver.email,
          reference,
        },
        {
          walletId: receiver.wallet.id,
          type: "TRANSFER_IN",
          amount,
          balanceAfter: credited.balance,
          counterparty: sender.user.email,
          reference,
        },
      ],
    });

    return { reference, balance: senderAfter.balance, receiverUserId: receiver.id };
  });
}

/** Credits a Stripe top-up exactly once per PaymentIntent. */
export async function creditTopUp(userId: string, amount: number, paymentIntentId: string) {
  return prisma.$transaction(async (tx) => {
    const already = await tx.processedPayment.findUnique({ where: { paymentIntentId } });
    if (already) return null;
    await tx.processedPayment.create({ data: { paymentIntentId } });

    const wallet = await tx.wallet.update({
      where: { userId },
      data: { balance: { increment: amount } },
    });
    await tx.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        type: "TOPUP",
        amount,
        balanceAfter: wallet.balance,
        reference: paymentIntentId,
      },
    });
    return wallet;
  });
}
