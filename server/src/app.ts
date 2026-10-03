import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "./lib/errors";
import { authRouter } from "./routes/auth";
import { paymentsRouter } from "./routes/payments";
import { walletRouter } from "./routes/wallet";

export function createApp() {
  const app = express();
  app.use(cors());
  // The Stripe webhook needs the raw body, so it is mounted before express.json().
  app.use("/payments", paymentsRouter);
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/auth", authRouter);
  app.use("/wallet", walletRouter);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    if (err instanceof ZodError) return res.status(400).json({ error: err.issues[0]?.message ?? "Invalid input" });
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  });
  return app;
}
