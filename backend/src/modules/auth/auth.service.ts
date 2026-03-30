// src/modules/auth/auth.service.ts
import { prisma } from "../../utils/prisma";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  rotateRefreshToken,
  revokeAllRefreshTokens,
} from "../../utils/token";

export const signUpUser = async (email: string, password: string) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email already registered. Please log in.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
    omit: { password: true },
  });

  await prisma.profile.create({ data: { userId: user.id } });

  // WHY: return both tokens on signup so the app is immediately
  // authenticated — user shouldn't have to log in after signing up.
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = await generateRefreshToken(user.id);

  return { user, accessToken, refreshToken };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = await generateRefreshToken(user.id);

  return { accessToken, refreshToken };
};

export const refreshUserToken = async (refreshToken: string) => {
  const result = await rotateRefreshToken(refreshToken);
  if (!result) throw new Error("Invalid or expired refresh token");
  return result;
};

export const logoutUser = async (userId: string) => {
  // Wipes all refresh tokens — logs out from every device
  await revokeAllRefreshTokens(userId);
};
