
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export type UserRole = "brand" | "creator";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

interface TokenPayload extends JwtPayload {
  sub: string;
  role: UserRole;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const token = authorization.slice(7);

  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const payload = jwt.verify(token, secret);

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      (payload.role !== "brand" && payload.role !== "creator")
    ) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    const typedPayload = payload as TokenPayload;

    req.user = {
      id: typedPayload.sub,
      role: typedPayload.role,
    };

    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

export function authorize(...roles: UserRole[]) {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    next();
  };
}
