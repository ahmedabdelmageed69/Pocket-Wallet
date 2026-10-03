import { prisma } from "./prisma";

/**
 * Runs `fn` once per Idempotency-Key. A retry with the same key returns the
 * stored response instead of moving money twice.
 */
export async function withIdempotency<T>(
  key: string | undefined,
  userId: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!key) return fn();
  const scoped = `${userId}:${key}`;
  const existing = await prisma.idempotencyKey.findUnique({ where: { key: scoped } });
  if (existing) return existing.response as T;
  const result = await fn();
  await prisma.idempotencyKey.create({
    data: { key: scoped, userId, response: result as object },
  });
  return result;
}
