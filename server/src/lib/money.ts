import { HttpError } from "./errors";

/** Converts a user-entered amount like "12.5" into integer cents (1250). */
export function toCents(input: string | number): number {
  const str = String(input).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(str)) throw new HttpError(400, "Invalid amount");
  const [whole, frac = ""] = str.split(".");
  const cents = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  if (cents <= 0) throw new HttpError(400, "Amount must be greater than zero");
  if (cents > 1_000_000) throw new HttpError(400, "Amount is above the 10,000 limit");
  return cents;
}

export const formatCents = (cents: number) => (cents / 100).toFixed(2);
