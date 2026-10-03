import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config";
import { useAuth } from "../store/auth";

/** Refreshes balance + history the moment money arrives (transfer or top-up webhook). */
export function useLiveWallet() {
  const token = useAuth((s) => s.token);
  const qc = useQueryClient();
  useEffect(() => {
    if (!token) return;
    const socket = io(API_URL, { auth: { token }, transports: ["websocket"] });
    socket.on("wallet:updated", () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    });
    return () => {
      socket.disconnect();
    };
  }, [token, qc]);
}
