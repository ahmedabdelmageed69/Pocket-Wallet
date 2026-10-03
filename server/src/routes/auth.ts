import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { requireAuth, signToken, type AuthedRequest } from "../lib/auth";
import { HttpError } from "../lib/errors";
import { prisma } from "../lib/prisma";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8),
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const email = body.email.toLowerCase();
    if (await prisma.user.findUnique({ where: { email } })) {
      throw new HttpError(409, "Email already registered");
    }
    const user = await prisma.user.create({
      data: {
        email,
        name: body.name,
        passwordHash: await bcrypt.hash(body.password, 10),
        wallet: { create: {} },
      },
    });
    res.status(201).json({ token: signToken(user.id), user: { id: user.id, name: user.name, email } });
  } catch (e) {
    next(e);
  }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new HttpError(401, "Wrong email or password");
    }
    res.json({ token: signToken(user.id), user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    next(e);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: (req as AuthedRequest).userId },
      select: { id: true, name: true, email: true },
    });
    res.json(user);
  } catch (e) {
    next(e);
  }
});
