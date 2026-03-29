// src/modules/workout/workout.routes.ts
import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  listExercises,
  createSession,
  fetchSession,
  finishSession,
  addExercise,
  addSet,
  listPRs,
} from "./workout.controller";

const workoutRouter = new Hono();

// All workout routes require auth
workoutRouter.use("*", authMiddleware);

// Exercises
workoutRouter.get("/exercises", listExercises);

// Sessions
workoutRouter.post("/session", createSession);
workoutRouter.get("/session/:sessionId", fetchSession);
workoutRouter.patch("/session/:sessionId/complete", finishSession);

// Exercises within a session
workoutRouter.post("/session/:sessionId/exercise", addExercise);

// Sets within a session exercise
workoutRouter.post(
  "/session/:sessionId/exercise/:sessionExerciseId/set",
  addSet,
);

// Personal records
workoutRouter.get("/prs", listPRs);

export default workoutRouter;
