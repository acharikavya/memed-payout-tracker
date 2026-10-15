
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Invalid request data",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  const err = error as Error & {
    statusCode?: number;
    code?: number;
  };

  if (err.code === 11000) {
    res.status(409).json({
      message: "Email is already registered",
    });
    return;
  }

  const statusCode = err.statusCode ?? 500;

  if (statusCode >= 500) {
    console.error("Request failed:", error);
  }

  res.status(statusCode).json({
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message,
  });
};
