// src/tests/nutrition.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { api, loginAsTestUser, cleanupTestUser } from "./helpers";
import { prisma } from "../utils/prisma";

const TEST_EMAIL = `nutrition_test_${Date.now()}@fitness.com`;
const TODAY = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
let token: string;
let foodItemId: string;
let logItemId: string;

beforeAll(async () => {
  token = await loginAsTestUser(TEST_EMAIL);
});

afterAll(async () => {
  await cleanupTestUser(TEST_EMAIL);
  await prisma.$disconnect();
});

describe("GET /nutrition/food/search", () => {
  it("returns results for a valid query", async () => {
    const res = await api
      .get("/nutrition/food/search?q=chicken")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.results).toBeDefined();
    expect(Array.isArray(res.body.results)).toBe(true);

    // Save a food item id for log tests
    if (res.body.results.length > 0) {
      foodItemId = res.body.results[0].id;
    }
  }, 15000); // WHY longer timeout: first search hits external API

  it("rejects short queries with 400", async () => {
    const res = await api
      .get("/nutrition/food/search?q=a")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("second search for same query hits cache (faster)", async () => {
    const start = Date.now();
    const res = await api
      .get("/nutrition/food/search?q=chicken")
      .set("Authorization", `Bearer ${token}`);

    const duration = Date.now() - start;
    expect(res.status).toBe(200);
    expect(res.body.source).toBe("cache");
    // Cache should respond in under 3 seconds
    expect(duration).toBeLessThan(3000);
  });
});

describe("GET /nutrition/log/:date", () => {
  it("returns an empty log for a date with no entries", async () => {
    const res = await api
      .get(`/nutrition/log/${TODAY}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(res.body.summary.totals.calories).toBe(0);
  });

  it("rejects invalid date format", async () => {
    const res = await api
      .get("/nutrition/log/not-a-date")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});

describe("POST /nutrition/log/:date/item", () => {
  it("adds a food item to today's log", async () => {
    // Skip if no food item found from search
    if (!foodItemId) return;

    const res = await api
      .post(`/nutrition/log/${TODAY}/item`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        foodItemId,
        mealType: "BREAKFAST",
        quantity: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.foodItem).toBeDefined();
    expect(res.body.mealType).toBe("BREAKFAST");
    logItemId = res.body.id;
  });

  it("rejects missing fields", async () => {
    const res = await api
      .post(`/nutrition/log/${TODAY}/item`)
      .set("Authorization", `Bearer ${token}`)
      .send({ foodItemId });

    expect(res.status).toBe(400);
  });

  it("rejects invalid meal type", async () => {
    const res = await api
      .post(`/nutrition/log/${TODAY}/item`)
      .set("Authorization", `Bearer ${token}`)
      .send({ foodItemId, mealType: "BRUNCH", quantity: 1 });

    expect(res.status).toBe(400);
  });

  it("daily log now shows the added item with macro totals", async () => {
    if (!foodItemId) return;

    const res = await api
      .get(`/nutrition/log/${TODAY}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    // Calories should now be above 0
    expect(res.body.summary.totals.calories).toBeGreaterThan(0);
    expect(res.body.summary.byMeal.BREAKFAST).toBeDefined();
  });
});

describe("PATCH /nutrition/log/:date/target", () => {
  it("sets a daily calorie target", async () => {
    const res = await api
      .patch(`/nutrition/log/${TODAY}/target`)
      .set("Authorization", `Bearer ${token}`)
      .send({ targetCalories: 2200 });

    expect(res.status).toBe(200);
    expect(res.body.targetCalories).toBe(2200);
  });
});

describe("DELETE /nutrition/log/item/:itemId", () => {
  it("removes a food item from the log", async () => {
    if (!logItemId) return;

    const res = await api
      .delete(`/nutrition/log/item/${logItemId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("returns 404 for already deleted item", async () => {
    if (!logItemId) return;

    const res = await api
      .delete(`/nutrition/log/item/${logItemId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe("POST /nutrition/bodystats", () => {
  it("logs a body stat entry", async () => {
    const res = await api
      .post("/nutrition/bodystats")
      .set("Authorization", `Bearer ${token}`)
      .send({ weightKg: 78.5, bodyFatPct: 18.2 });

    expect(res.status).toBe(201);
    expect(res.body.weightKg).toBe(78.5);
    expect(res.body.bodyFatPct).toBe(18.2);
  });

  it("rejects empty body", async () => {
    const res = await api
      .post("/nutrition/bodystats")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe("GET /nutrition/bodystats", () => {
  it("returns body stat history", async () => {
    const res = await api
      .get("/nutrition/bodystats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].weightKg).toBeDefined();
  });
});
