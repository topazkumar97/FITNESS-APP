// src/modules/auth/auth.route.ts
import { Hono } from "hono";
import { signup, login, refresh, logout } from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const authRouter = new Hono();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
// WHY authMiddleware on logout: you need to know WHO is logging out
authRouter.post("/logout", authMiddleware, logout);

export default authRouter;
