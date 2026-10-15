
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { loginUser, signupUser } from "../services/auth.service";

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
  role: z.enum(["brand", "creator"]),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72),
});

export async function signup(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = signupSchema.parse(req.body);
    const result = await signupUser(input);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
