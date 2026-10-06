export const MORGAN_FORMAT = `:method :url  :response-time [:status] \n`;

import mongoose from "mongoose";
export const shapeIntoMongooseObjectId = (target: any) => {
  return typeof target === "string"
    ? new mongoose.Types.ObjectId(target)
    : target;
};
export const AUTH_TIMER = "24";

/**
 * A phone number is accepted when it carries 9-15 digits. Separators people
 * actually type (+, spaces, dashes, parentheses) are allowed around them;
 * anything else — letters, @#$% — is rejected.
 */
export const isValidPhone = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!/^\+?[\d\s()-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
};

/** A positive integer query value, or the fallback; capped at max. */
export const toPositiveInt = (
  value: unknown,
  fallback: number,
  max = Number.MAX_SAFE_INTEGER,
): number => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? Math.min(n, max) : fallback;
};

export const MAX_PAGE_SIZE = 100;

/** Makes user input safe to embed in a RegExp, so it matches literally. */
export const escapeRegExp = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
