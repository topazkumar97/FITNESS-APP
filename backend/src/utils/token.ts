// src/utils/token.ts
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

// ─── ACCESS TOKEN ────────────────────────────────────────────────────────────

export const generateAccessToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
};

// ─── REFRESH TOKEN ───────────────────────────────────────────────────────────

// WHY crypto.randomBytes: refresh tokens are NOT JWTs.
// They're just random opaque strings stored in the DB.
// No payload to decode — the DB lookup IS the verification.
export const generateRefreshToken = async (userId: string) => {
  const token = crypto.randomBytes(64).toString("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
};

// WHY: rotation — we delete the old token and issue a brand new one.
// If a stolen token is used after the real user already refreshed,
// the old token won't exist in DB and we return null (invalid).
export const rotateRefreshToken = async (oldToken: string) => {
  const existing = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
  });

  // Token doesn't exist — either expired, already rotated, or stolen
  if (!existing) return null;

  // Token exists but is past its expiry date
  if (existing.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { token: oldToken } });
    return null;
  }

  // Delete the old token — this is the "rotation" part
  await prisma.refreshToken.delete({ where: { token: oldToken } });

  // Issue a fresh pair
  const newRefreshToken = await generateRefreshToken(existing.userId);
  const newAccessToken = generateAccessToken(existing.userId, "");

  return {
    userId: existing.userId,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// Used on logout — wipes all refresh tokens for a user (log out all devices)
export const revokeAllRefreshTokens = async (userId: string) => {
  await prisma.refreshToken.deleteMany({ where: { userId } });
};
