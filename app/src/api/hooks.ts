import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Entry, type Wallet } from "./client";

export const useWallet = () => useQuery({ queryKey: ["wallet"], queryFn: () => api<Wallet>("/wallet") });

export const useTransactions = () =>
  useInfiniteQuery({
    queryKey: ["transactions"],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      api<{ items: Entry[]; nextCursor: string | null }>(
        `/wallet/transactions${pageParam ? `?cursor=${pageParam}` : ""}`
      ),
    getNextPageParam: (last) => last.nextCursor,
  });

export function useTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { toEmail: string; amount: string; key: string }) =>
      api<{ balance: number }>("/wallet/transfer", {
        method: "POST",
        body: JSON.stringify({ toEmail: v.toEmail, amount: v.amount }),
        idempotencyKey: v.key,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
