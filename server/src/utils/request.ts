import { Response } from "express";

export const getRouteParam = (
  value: string | string[] | undefined,
  res: Response,
  label = "id"
): string | null => {
  if (typeof value === "string" && value.trim()) return value;
  res.status(400).json({ message: `Invalid ${label}` });
  return null;
};

export const toBoundedInteger = (
  value: unknown,
  fallback: number,
  min: number,
  max: number
): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), min), max);
};
