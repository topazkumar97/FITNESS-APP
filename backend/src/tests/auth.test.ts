// src/tests/auth.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { api, cleanupTestUser } from "./helpers";
import { prisma } from "../utils/prisma";

const TEST_EMAIL = `auth_test_${Date.now()}@fitness.com`;
const TEST_PASSWORD = "SecurePassword123";

afterAll(async () => {
  await cleanupTestUser(TEST_EMAIL);
  await prisma.$disconnect();
});

describe("POST /auth/signup", () => {
  it("creates a new user and returns a token", async () => {
    const res = await api
      .post("/auth/signup")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    // WHY: the password must NEVER appear in any response
    expect(res.body.user?.password).toBeUndefined();
  });

  it("rejects duplicate email with a clear error", async () => {
    const res = await api
      .post("/auth/signup")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already registered/i);
  });
});

describe("POST /auth/login", () => {
  it("returns a token with correct credentials", async () => {
    const res = await api
      .post("/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects wrong password with 401", async () => {
    const res = await api
      .post("/auth/login")
      .send({ email: TEST_EMAIL, password: "wrongpassword" });

    expect(res.status).toBe(401);
    // WHY: should NOT say "wrong password" — that's user enumeration
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("rejects unknown email with 401", async () => {
    const res = await api
      .post("/auth/login")
      .send({ email: "nobody@nowhere.com", password: "whatever" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("rejects request with no Authorization header on protected routes", async () => {
    const res = await api.get("/user/me");
    expect(res.status).toBe(401);
  });
});
