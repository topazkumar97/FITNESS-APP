// src/modules/auth/auth.controller.ts
import { Context } from "hono";
import {
  signUpUser,
  loginUser,
  refreshUserToken,
  logoutUser,
} from "./auth.service";

export const signup = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();
    const result = await signUpUser(email, password);
    return c.json(result, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
};

export const login = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();
    const result = await loginUser(email, password);
    return c.json(result);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 401);
  }
};

export const refresh = async (c: Context) => {
  try {
    const { refreshToken } = await c.req.json();
    if (!refreshToken) {
      return c.json({ error: "Refresh token required" }, 400);
    }
    const result = await refreshUserToken(refreshToken);
    return c.json(result);
  } catch (error) {
    // WHY 401: an invalid refresh token means the session is gone.
    // Client must send user back to login screen.
    return c.json({ error: (error as Error).message }, 401);
  }
};

export const logout = async (c: Context) => {
  try {
    const user = c.get("user") as { userId: string };
    await logoutUser(user.userId);
    return c.json({ message: "Logged out successfully" });
  } catch (error) {
    return c.json({ error: "Logout failed" }, 500);
  }
};
