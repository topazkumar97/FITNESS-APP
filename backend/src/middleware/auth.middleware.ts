import jwt from "jsonwebtoken";
import { Context } from "hono";

const JWT_SECRET = process.env.JWT_SECRET!;

export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
  const authHeader = c.req.header("Authorization");
  console.log("Auth Header:", authHeader); // Debugging log
  if (!authHeader) {
    return c.text("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted Token:", token); // Debugging log
  if (!token) {
    return c.text("Unauthorized", 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token:", decoded); // Debugging log
    c.set("user", decoded);
    await next();
  } catch (error) {
    console.log("JWT Verification Error:", error); // Debugging log
    return c.text("Unauthorized", 401);
  }
};
