import { Context } from "hono";
import { prisma } from "../../utils/prisma";

export const getMe = async (c: Context) => {
  try {
    const user = c.get("user");

    const profile = await prisma.profile.findUnique({
      where: { userId: user.userId },
    });

    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    return c.json(profile);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};

export const updateProfile = async (c: Context) => {
  try {
    const user = c.get("user") as { userId: string };
    const body = await c.req.json();

    // Strip out fields the user shouldn't be able to set directly
    const { name, age, height, weight, goal } = body;

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.userId },
      update: { name, age, height, weight, goal },
      create: { name, age, height, weight, goal, userId: user.userId },
    });

    return c.json(updatedProfile);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
};
