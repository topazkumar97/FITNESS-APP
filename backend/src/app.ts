// src/app.ts
import { Hono } from "hono";
import { prisma } from "./utils/prisma";
import authRoutes from "./modules/auth/auth.route";
import userRoutes from "./modules/user/user.routes";

const app = new Hono();

app.get("/", (c) => c.text("Fitness API Running"));

app.get("/test-db", async (c) => {
  try {
    const users = await prisma.user.findMany();
    return c.json(users);
  } catch (error) {
    console.error("Database connection error:", error);
    return c.text("Database connection error", 500);
  }
});

app.get("/seed", async (c) => {
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      password: "123456",
    },
  });

  return c.json(user);
});

app.route("/auth", authRoutes);
app.route("/user", userRoutes);
export default app;
