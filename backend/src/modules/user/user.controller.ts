import { Context } from "hono";
import { prisma } from "../../utils/prisma";

export const getMe = async (c: Context) => {
  const user = c.get("user");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.userId },
  });

  if (!profile) {
    return c.text("Profile not found", 404);
  }

  return c.json(profile);
};

export const updateProfile = async (c: Context) => {
  const user = c.get("user");
  const body = await c.req.json();

  const updatedProfile = await prisma.profile.upsert({
    where: { userId: user.userId },
    update: body,
    create: { ...body, userId: user.userId },
  });

  return c.json(updatedProfile);
};
