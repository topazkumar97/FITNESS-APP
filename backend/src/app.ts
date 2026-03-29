// src/app.ts
import { Hono } from "hono";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import workoutRoutes from "./modules/workout/workout.routes";

const app = new Hono();

app.get("/", (c) => c.json({ status: "ok", service: "fitness-api" }));

app.route("/auth", authRoutes);
app.route("/user", userRoutes);
app.route("/workout", workoutRoutes);

export default app;
