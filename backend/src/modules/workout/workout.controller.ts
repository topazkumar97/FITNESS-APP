// src/modules/workout/workout.controller.ts
import { Context } from "hono";
import {
  getExercises,
  startSession,
  getSession,
  completeSession,
  addExerciseToSession,
  logSet,
  getUserPRs,
} from "./workout.service";

const getUser = (c: Context): { userId: string } =>
  c.get("user") as { userId: string };

export const listExercises = async (c: Context) => {
  try {
    const { muscleGroup, category, equipment, search } = c.req.query();
    const exercises = await getExercises({
      ...(muscleGroup !== undefined && { muscleGroup }),
      ...(category !== undefined && { category }),
      ...(equipment !== undefined && { equipment }),
      ...(search !== undefined && { search }),
    });
    return c.json(exercises);
  } catch (e) {
    return c.json({ error: "Failed to fetch exercises" }, 500);
  }
};

export const createSession = async (c: Context) => {
  try {
    const { userId } = getUser(c);
    const body = await c.req.json().catch(() => ({}));
    const session = await startSession(userId, body);
    return c.json(session, 201);
  } catch (e) {
    return c.json({ error: "Failed to start session" }, 500);
  }
};

export const fetchSession = async (c: Context) => {
  try {
    const { userId } = getUser(c);
    const sessionId = c.req.param("sessionId");
    if (!sessionId) return c.json({ error: "sessionId is required" }, 400);
    const session = await getSession(sessionId, userId);
    if (!session) return c.json({ error: "Session not found" }, 404);
    return c.json(session);
  } catch (e) {
    if ((e as Error).message === "FORBIDDEN")
      return c.json({ error: "Forbidden" }, 403);
    return c.json({ error: "Failed to fetch session" }, 500);
  }
};

export const finishSession = async (c: Context) => {
  try {
    const { userId } = getUser(c);
    const sessionId = c.req.param("sessionId");
    if (!sessionId) return c.json({ error: "sessionId is required" }, 400);
    const session = await completeSession(sessionId, userId);
    return c.json(session);
  } catch (e) {
    if ((e as Error).message === "FORBIDDEN")
      return c.json({ error: "Forbidden" }, 403);
    return c.json({ error: "Failed to complete session" }, 500);
  }
};

export const addExercise = async (c: Context) => {
  try {
    const { userId } = getUser(c);
    const sessionId = c.req.param("sessionId");
    if (!sessionId) return c.json({ error: "sessionId is required" }, 400);
    const { exerciseId } = await c.req.json();
    if (!exerciseId) return c.json({ error: "exerciseId is required" }, 400);
    const result = await addExerciseToSession(sessionId, userId, exerciseId);
    return c.json(result, 201);
  } catch (e) {
    if ((e as Error).message === "FORBIDDEN")
      return c.json({ error: "Forbidden" }, 403);
    return c.json({ error: (e as Error).message }, 500);
  }
};

export const addSet = async (c: Context) => {
  try {
    const { userId } = getUser(c);
    const sessionId = c.req.param("sessionId");
    const sessionExerciseId = c.req.param("sessionExerciseId");
    if (!sessionId) return c.json({ error: "sessionId is required" }, 400);
    if (!sessionExerciseId)
      return c.json({ error: "sessionExerciseId is required" }, 400);
    const body = await c.req.json();
    const result = await logSet(sessionId, sessionExerciseId, userId, body);
    // 201 if new set, and we tell the frontend if it's a PR
    return c.json(result, 201);
  } catch (e) {
    if ((e as Error).message === "FORBIDDEN")
      return c.json({ error: "Forbidden" }, 403);
    return c.json({ error: "Failed to log set" }, 500);
  }
};

export const listPRs = async (c: Context) => {
  try {
    const { userId } = getUser(c);
    const prs = await getUserPRs(userId);
    return c.json(prs);
  } catch (e) {
    return c.json({ error: "Failed to fetch PRs" }, 500);
  }
};
