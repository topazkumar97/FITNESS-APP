import { getMe, updateProfile } from "./user.controller";
import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth.middleware";

const userRouter = new Hono();

userRouter.get("/me", authMiddleware, getMe);
userRouter.put("/me", authMiddleware, updateProfile);

export default userRouter;
