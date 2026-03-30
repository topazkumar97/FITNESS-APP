// src/tests/auth.test.ts
import { describe, it, expect, afterAll } from "vitest";
import { api, cleanupTestUser } from "./helpers";
import { prisma } from "../utils/prisma";

const TEST_EMAIL = `auth_test_${Date.now()}@fitness.com`;
const TEST_PASSWORD = "SecurePassword123";
let refreshToken: string;

afterAll(async () => {
  await cleanupTestUser(TEST_EMAIL);
  await prisma.$disconnect();
});

describe("POST /auth/signup", () => {
  it("creates a new user and returns both tokens", async () => {
    const res = await api
      .post("/auth/signup")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
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
  it("returns both tokens with correct credentials", async () => {
    const res = await api
      .post("/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    refreshToken = res.body.refreshToken;
  });

  it("rejects wrong password with 401", async () => {
    const res = await api
      .post("/auth/login")
      .send({ email: TEST_EMAIL, password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("rejects unknown email with 401", async () => {
    const res = await api
      .post("/auth/login")
      .send({ email: "nobody@nowhere.com", password: "whatever" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });
});

describe("POST /auth/refresh", () => {
  it("returns new access and refresh tokens", async () => {
    const res = await api.post("/auth/refresh").send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    // WHY: the old refresh token must be different from the new one
    expect(res.body.refreshToken).not.toBe(refreshToken);
    // Save the new one for the rotation test
    refreshToken = res.body.refreshToken;
  });

  it("rejects the old refresh token after rotation", async () => {
    // Log in again to get a fresh token pair
    const loginRes = await api
      .post("/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    const oldToken = loginRes.body.refreshToken;

    // Use it once — rotates it
    await api.post("/auth/refresh").send({ refreshToken: oldToken });

    // Try to use the old token again — must fail
    const res = await api
      .post("/auth/refresh")
      .send({ refreshToken: oldToken });

    expect(res.status).toBe(401);
  });

  it("rejects missing refresh token with 400", async () => {
    const res = await api.post("/auth/refresh").send({});
    expect(res.status).toBe(400);
  });
});

describe("POST /auth/logout", () => {
  it("logs out and invalidates all refresh tokens", async () => {
    // Login to get fresh tokens
    const loginRes = await api
      .post("/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    const { accessToken, refreshToken: rt } = loginRes.body;

    // Logout
    const logoutRes = await api
      .post("/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(logoutRes.status).toBe(200);

    // Refresh token should now be invalid
    const refreshRes = await api
      .post("/auth/refresh")
      .send({ refreshToken: rt });

    expect(refreshRes.status).toBe(401);
  });
});

describe("Protected routes", () => {
  it("returns 401 with no token", async () => {
    const res = await api.get("/user/me");
    expect(res.status).toBe(401);
  });

  it("returns TOKEN_EXPIRED code on expired token", async () => {
    // A manually crafted expired JWT for testing
    const expiredToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
      "eyJ1c2VySWQiOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDF9." +
      "invalid";

    const res = await api
      .get("/user/me")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
  });
});
