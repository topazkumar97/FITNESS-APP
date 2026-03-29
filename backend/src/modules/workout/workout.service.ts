// src/modules/workout/workout.service.ts
import { prisma } from "../../utils/prisma";
import { MuscleGroup, ExerciseCategory } from "../../generated/prisma";

// ─── EXERCISES ───────────────────────────────────────────────────────────────

export const getExercises = async (filters: {
  muscleGroup?: string;
  category?: string;
  equipment?: string;
  search?: string;
}) => {
  return prisma.exercise.findMany({
    where: {
      // WHY: every filter is optional. if not provided, it's ignored.
      ...(filters.muscleGroup && {
        muscleGroup: filters.muscleGroup as MuscleGroup,
      }),
      ...(filters.category && {
        category: filters.category as ExerciseCategory,
      }),
      ...(filters.equipment && { equipment: filters.equipment as any }),
      ...(filters.search && {
        name: { contains: filters.search, mode: "insensitive" },
      }),
    },
    orderBy: { name: "asc" },
  });
};

// ─── SESSION ─────────────────────────────────────────────────────────────────

export const startSession = async (
  userId: string,
  data: { planId?: string; notes?: string },
) => {
  return prisma.workoutSession.create({
    data: {
      userId,
      ...(data.planId !== undefined && { planId: data.planId }),
      ...(data.notes !== undefined && { notes: data.notes }),
      // startedAt defaults to now() via schema
    },
  });
};

export const getSession = async (sessionId: string, userId: string) => {
  const session = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      exercises: {
        orderBy: { orderIndex: "asc" },
        include: {
          exercise: true, // the exercise definition
          sets: {
            orderBy: { setNumber: "asc" },
          },
        },
      },
      plan: { select: { name: true } },
    },
  });

  // WHY: always verify the resource belongs to the requesting user.
  // Never trust that the sessionId alone is enough authorization.
  if (!session) return null;
  if (session.userId !== userId) throw new Error("FORBIDDEN");

  return session;
};

export const completeSession = async (sessionId: string, userId: string) => {
  // Verify ownership first
  const session = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) throw new Error("Session not found");
  if (session.userId !== userId) throw new Error("FORBIDDEN");

  const completedAt = new Date();

  // WHY: calculate duration here on the server, not the client.
  // Client clocks can be wrong or manipulated.
  const durationMin = Math.round(
    (completedAt.getTime() - session.startedAt.getTime()) / 1000 / 60,
  );

  return prisma.workoutSession.update({
    where: { id: sessionId },
    data: { completedAt, durationMin },
  });
};

// ─── SESSION EXERCISES ────────────────────────────────────────────────────────

export const addExerciseToSession = async (
  sessionId: string,
  userId: string,
  exerciseId: string,
) => {
  // Verify session belongs to user
  const session = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: { exercises: { select: { orderIndex: true } } },
  });
  if (!session) throw new Error("Session not found");
  if (session.userId !== userId) throw new Error("FORBIDDEN");

  // WHY: orderIndex auto-increments based on existing exercises.
  // The next exercise gets the next available index.
  const nextIndex = session.exercises.length;

  return prisma.sessionExercise.create({
    data: { sessionId, exerciseId, orderIndex: nextIndex },
    include: { exercise: true },
  });
};

// ─── SETS ─────────────────────────────────────────────────────────────────────

export const logSet = async (
  sessionId: string,
  sessionExerciseId: string,
  userId: string,
  data: {
    reps?: number;
    weightKg?: number;
    durationSeconds?: number;
    restSeconds?: number;
    isWarmup?: boolean;
  },
) => {
  // Verify the sessionExercise belongs to a session owned by this user
  const sessionExercise = await prisma.sessionExercise.findUnique({
    where: { id: sessionExerciseId },
    include: { session: true },
  });
  if (!sessionExercise) throw new Error("Exercise not found in session");
  if (sessionExercise.session.userId !== userId) throw new Error("FORBIDDEN");
  if (sessionExercise.sessionId !== sessionId)
    throw new Error("Exercise does not belong to this session");

  // Auto-increment set number
  const existingSets = await prisma.exerciseSet.count({
    where: { sessionExerciseId },
  });

  const newSet = await prisma.exerciseSet.create({
    data: {
      sessionExerciseId,
      setNumber: existingSets + 1,
      ...(data.reps !== undefined && { reps: data.reps }),
      ...(data.weightKg !== undefined && { weightKg: data.weightKg }),
      ...(data.durationSeconds !== undefined && {
        durationSeconds: data.durationSeconds,
      }),
      ...(data.restSeconds !== undefined && { restSeconds: data.restSeconds }),
      isWarmup: data.isWarmup ?? false,
    },
  });

  // ── PR CHECK ────────────────────────────────────────────────────
  // WHY: we check for a PR on every non-warmup set automatically.
  // The user doesn't have to do anything — it just appears in their history.
  // This is a core feature that makes the app feel smart.
  let newPR = false;
  if (!data.isWarmup && data.weightKg && data.reps) {
    const existingPR = await prisma.personalRecord.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId: sessionExercise.exerciseId,
        },
      },
    });

    // A new PR if: no previous PR exists, OR new weight is heavier,
    // OR same weight with more reps
    const isPR =
      !existingPR ||
      data.weightKg > existingPR.weightKg ||
      (data.weightKg === existingPR.weightKg && data.reps > existingPR.reps);

    if (isPR) {
      await prisma.personalRecord.upsert({
        where: {
          userId_exerciseId: {
            userId,
            exerciseId: sessionExercise.exerciseId,
          },
        },
        update: {
          weightKg: data.weightKg,
          reps: data.reps,
          achievedAt: new Date(),
        },
        create: {
          userId,
          exerciseId: sessionExercise.exerciseId,
          weightKg: data.weightKg,
          reps: data.reps,
        },
      });
      newPR = true;
    }
  }

  // WHY: we return newPR flag so the frontend can show a celebration
  // animation when a user breaks their record
  return { set: newSet, newPR };
};

export const getUserPRs = async (userId: string) => {
  return prisma.personalRecord.findMany({
    where: { userId },
    include: { exercise: { select: { name: true, muscleGroup: true } } },
    orderBy: { achievedAt: "desc" },
  });
};
