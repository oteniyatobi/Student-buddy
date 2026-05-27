import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const status = err.statusCode ?? 500;
  const message = err.message || "Internal server error";
  console.error(`[Error] ${status} — ${message}`, err.stack);
  res.status(status).json({ message });
};

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ message: "Route not found" });
};
