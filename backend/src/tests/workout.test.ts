// src/tests/workout.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { api, loginAsTestUser, cleanupTestUser } from "./helpers";
import { prisma } from "../utils/prisma";

const TEST_EMAIL = `workout_test_${Date.now()}@fitness.com`;
let token: string;
let sessionId: string;
let sessionExerciseId: string;
let exerciseId: string;

beforeAll(async () => {
  token = await loginAsTestUser(TEST_EMAIL);

  // Grab a real exercise ID from the seeded library
  const exercise = await prisma.exercise.findFirst({
    where: { name: "Barbell Bench Press" },
  });
  exerciseId = exercise!.id;
});

afterAll(async () => {
  await cleanupTestUser(TEST_EMAIL);
  await prisma.$disconnect();
});

describe("GET /workout/exercises", () => {
  it("returns all exercises", async () => {
    const res = await api
      .get("/workout/exercises")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("filters by muscleGroup", async () => {
    const res = await api
      .get("/workout/exercises?muscleGroup=CHEST")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.every((e: any) => e.muscleGroup === "CHEST")).toBe(true);
  });

  it("filters by search term", async () => {
    const res = await api
      .get("/workout/exercises?search=curl")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(
      res.body.every((e: any) => e.name.toLowerCase().includes("curl")),
    ).toBe(true);
  });
});

describe("POST /workout/session", () => {
  it("starts a new workout session", async () => {
    const res = await api
      .post("/workout/session")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.completedAt).toBeNull();
    sessionId = res.body.id; // save for subsequent tests
  });
});

describe("POST /workout/session/:sessionId/exercise", () => {
  it("adds an exercise to the session", async () => {
    const res = await api
      .post(`/workout/session/${sessionId}/exercise`)
      .set("Authorization", `Bearer ${token}`)
      .send({ exerciseId });

    expect(res.status).toBe(201);
    expect(res.body.exerciseId).toBe(exerciseId);
    sessionExerciseId = res.body.id; // save for set tests
  });

  it("rejects missing exerciseId", async () => {
    const res = await api
      .post(`/workout/session/${sessionId}/exercise`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe("POST /workout/session/:sessionId/exercise/:sessionExerciseId/set", () => {
  it("logs a set and detects a new PR (first ever set)", async () => {
    const res = await api
      .post(`/workout/session/${sessionId}/exercise/${sessionExerciseId}/set`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reps: 8, weightKg: 80, restSeconds: 90 });

    expect(res.status).toBe(201);
    expect(res.body.set.setNumber).toBe(1);
    // First ever set = always a PR
    expect(res.body.newPR).toBe(true);
  });

  it("logs a second set — no PR since weight is lower", async () => {
    const res = await api
      .post(`/workout/session/${sessionId}/exercise/${sessionExerciseId}/set`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reps: 8, weightKg: 60, restSeconds: 90 });

    expect(res.status).toBe(201);
    expect(res.body.set.setNumber).toBe(2);
    expect(res.body.newPR).toBe(false);
  });

  it("logs a heavier set — detects new PR", async () => {
    const res = await api
      .post(`/workout/session/${sessionId}/exercise/${sessionExerciseId}/set`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reps: 8, weightKg: 100, restSeconds: 90 });

    expect(res.status).toBe(201);
    expect(res.body.newPR).toBe(true);
  });
});

describe("PATCH /workout/session/:sessionId/complete", () => {
  it("completes the session and calculates duration", async () => {
    const res = await api
      .patch(`/workout/session/${sessionId}/complete`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.completedAt).not.toBeNull();
    // Duration should be 0 or 1 min in tests (runs fast)
    expect(res.body.durationMin).toBeGreaterThanOrEqual(0);
  });
});

describe("GET /workout/session/:sessionId", () => {
  it("returns full session with nested exercises and sets", async () => {
    const res = await api
      .get(`/workout/session/${sessionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.exercises.length).toBe(1);
    expect(res.body.exercises[0].sets.length).toBe(3);
  });

  it("returns 403 when accessing another user's session", async () => {
    // Create a second user
    const otherEmail = `other_${Date.now()}@fitness.com`;
    const otherToken = await loginAsTestUser(otherEmail);

    const res = await api
      .get(`/workout/session/${sessionId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(403);

    // cleanup second user
    await cleanupTestUser(otherEmail);
  });
});

describe("GET /workout/prs", () => {
  it("returns all personal records for the user", async () => {
    const res = await api
      .get("/workout/prs")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].exercise.name).toBeDefined();
  });
});
