// src/app.ts
import { Hono } from "hono";
import { prisma } from "./utils/prisma";
import authRoutes from "./modules/auth/auth.route";
import userRoutes from "./modules/user/user.routes";

const app = new Hono();

app.get("/", (c) => c.text("Fitness API Running"));

app.route("/auth", authRoutes);
app.route("/user", userRoutes);
export default app;
