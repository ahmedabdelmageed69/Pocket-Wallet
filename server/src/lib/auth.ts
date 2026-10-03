import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "./errors";

const secret = () => process.env.JWT_SECRET ?? "dev-secret";

export type AuthedRequest = Request & { userId: string };

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, secret(), { expiresIn: "7d" });
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, "Missing token"));
  try {
    const payload = jwt.verify(token, secret()) as { sub: string };
    (req as AuthedRequest).userId = payload.sub;
    next();
  } catch {
    next(new HttpError(401, "Invalid token"));
  }
}
