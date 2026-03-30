// src/middleware/auth.middleware.ts
import { Context } from "hono";
import { verifyAccessToken } from "../utils/token";

export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return c.json({ error: "Unauthorized" }, 401);

  const token = authHeader.split(" ")[1];
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  try {
    const decoded = verifyAccessToken(token);
    c.set("user", decoded);
    await next();
  } catch (error) {
    // WHY: distinguish between expired and invalid tokens.
    // Expired = client should try refresh. Invalid = force login.
    const isExpired = error instanceof Error && error.message === "jwt expired";
    return c.json(
      {
        error: isExpired ? "Token expired" : "Unauthorized",
        code: isExpired ? "TOKEN_EXPIRED" : "UNAUTHORIZED",
      },
      401,
    );
  }
};
