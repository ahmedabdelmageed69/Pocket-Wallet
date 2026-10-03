import { API_URL } from "../config";
import { useAuth } from "../store/auth";

export class ApiError extends Error {}

export async function api<T>(path: string, init: RequestInit & { idempotencyKey?: string } = {}): Promise<T> {
  const { token, signOut } = useAuth.getState();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.idempotencyKey ? { "Idempotency-Key": init.idempotencyKey } : {}),
      ...init.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 401 && token) await signOut();
  if (!res.ok) throw new ApiError(body.error ?? "Request failed");
  return body as T;
}

export type Wallet = { balance: number; currency: string };
export type Entry = {
  id: string;
  type: "TOPUP" | "TRANSFER_IN" | "TRANSFER_OUT";
  amount: number;
  balanceAfter: number;
  counterparty: string | null;
  createdAt: string;
};

export const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
