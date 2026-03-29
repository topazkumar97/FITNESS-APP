// src/tests/user.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { api, loginAsTestUser, cleanupTestUser } from "./helpers";
import { prisma } from "../utils/prisma";

const TEST_EMAIL = `user_test_${Date.now()}@fitness.com`;
let token: string;

beforeAll(async () => {
  token = await loginAsTestUser(TEST_EMAIL);
});

afterAll(async () => {
  await cleanupTestUser(TEST_EMAIL);
  await prisma.$disconnect();
});

describe("GET /user/me", () => {
  it("returns the user profile when authenticated", async () => {
    const res = await api
      .get("/user/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    // Profile is auto-created on signup
    expect(res.body).toHaveProperty("userId");
  });

  it("returns 401 without a token", async () => {
    const res = await api.get("/user/me");
    expect(res.status).toBe(401);
  });
});

describe("PUT /user/me", () => {
  it("updates the user profile fields", async () => {
    const res = await api
      .put("/user/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Topaz", age: 28, weightKg: 75, goal: "BUILD_MUSCLE" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Topaz");
    expect(res.body.age).toBe(28);
    expect(res.body.goal).toBe("BUILD_MUSCLE");
  });

  it("persists the update — GET /user/me reflects the change", async () => {
    const res = await api
      .get("/user/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Topaz");
  });
});
