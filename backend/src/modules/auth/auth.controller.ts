import { signUpUser, loginUser } from "./auth.service";
import { Context } from "hono";

export const signup = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();
    const result = await signUpUser(email, password);
    return c.json(result, 201); // 201 = Created, not 200
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
    //Return JSON errors, not plain text. Frontend can parse JSON.
  }
};

export const login = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();
    const result = await loginUser(email, password);
    return c.json(result);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 401);
    // 401 = Unauthorized. Wrong credentials isn't a 400 Bad Request.
  }
};
