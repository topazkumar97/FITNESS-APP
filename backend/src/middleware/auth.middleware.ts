import jwt from "jsonwebtoken";
import { Context } from "hono";

const JWT_SECRET = process.env.JWT_SECRET!;

export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.text("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return c.text("Unauthorized", 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    c.set("user", decoded);
    await next();
  } catch (error) {
    return c.text("Unauthorized", 401);
  }
};
