import { prisma } from "../../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const signUpUser = async (email: string, password: string) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email already registered. Please log in.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
    omit: { password: true }, // strips password from the returned object
  });

  // Create an empty profile for the new user so /user/me never returns 404s on new users
  await prisma.profile.create({
    data: { userId: user.id },
  });

  const token = jwt.sign({ userId: user.id, email: user.id }, JWT_SECRET, {
    expiresIn: "15m", // WHY: Short-lived. We'll add refresh tokens next.
  });

  return { user, token };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "15m" });

  return { token };
};
