import { Hono } from "hono";
import { signup, login } from "./auth.controller";

const authRouter = new Hono();

authRouter.post("/signup", signup);
authRouter.post("/login", login);

export default authRouter;
