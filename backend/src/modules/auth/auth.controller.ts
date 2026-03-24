import { signUpUser, loginUser } from "./auth.service";
import { Context } from "hono";

export const signup = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();
    const user = await signUpUser(email, password);
    return c.json(user);
  } catch (error) {
    return c.text((error as Error).message, 400);
  }
};

export const login = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();
    const token = await loginUser(email, password);
    return c.json({ token });
  } catch (error) {
    return c.text((error as Error).message, 400);
  }
};
