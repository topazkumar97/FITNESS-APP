/*
  Warnings:

  - You are about to drop the column `height` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Profile` table. All the data in the column will be lost.
  - The `goal` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('LOSE_WEIGHT', 'BUILD_MUSCLE', 'IMPROVE_ENDURANCE', 'MAINTAIN', 'IMPROVE_FLEXIBILITY');

-- CreateEnum
CREATE TYPE "FitnessLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'FOREARMS', 'CORE', 'GLUTES', 'QUADS', 'HAMSTRINGS', 'CALVES', 'FULL_BODY', 'CARDIO');

-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('STRENGTH', 'CARDIO', 'FLEXIBILITY', 'BALANCE', 'PLYOMETRIC');

-- CreateEnum
CREATE TYPE "Equipment" AS ENUM ('BARBELL', 'DUMBBELL', 'CABLE', 'MACHINE', 'BODYWEIGHT', 'KETTLEBELL', 'RESISTANCE_BAND', 'OTHER');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "height",
DROP COLUMN "weight",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "fitnessLevel" "FitnessLevel",
ADD COLUMN     "heightCm" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
ADD COLUMN     "weightKg" DOUBLE PRECISION,
DROP COLUMN "goal",
ADD COLUMN     "goal" "Goal";

-- AlterTable
ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "muscleGroup" "MuscleGroup" NOT NULL,
    "category" "ExerciseCategory" NOT NULL,
    "equipment" "Equipment" NOT NULL DEFAULT 'BODYWEIGHT',
    "instructions" TEXT,
    "videoUrl" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPlanExercise" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "targetSets" INTEGER,
    "targetReps" INTEGER,
    "targetWeightKg" DOUBLE PRECISION,

    CONSTRAINT "WorkoutPlanExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMin" INTEGER,
    "notes" TEXT,

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionExercise" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "SessionExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseSet" (
    "id" TEXT NOT NULL,
    "sessionExerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "reps" INTEGER,
    "weightKg" DOUBLE PRECISION,
    "durationSeconds" INTEGER,
    "restSeconds" INTEGER,
    "isWarmup" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "logDate" DATE NOT NULL,
    "targetCalories" INTEGER,

    CONSTRAINT "NutritionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionLogItem" (
    "id" TEXT NOT NULL,
    "logId" TEXT NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "mealType" "MealType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NutritionLogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodItem" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "calories" DOUBLE PRECISION NOT NULL,
    "proteinG" DOUBLE PRECISION NOT NULL,
    "carbsG" DOUBLE PRECISION NOT NULL,
    "fatG" DOUBLE PRECISION NOT NULL,
    "fiberG" DOUBLE PRECISION,
    "servingSize" DOUBLE PRECISION NOT NULL,
    "servingUnit" TEXT NOT NULL DEFAULT 'g',

    CONSTRAINT "FoodItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyStat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "bodyFatPct" DOUBLE PRECISION,
    "muscleMassKg" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BodyStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "Exercise_muscleGroup_idx" ON "Exercise"("muscleGroup");

-- CreateIndex
CREATE INDEX "Exercise_category_idx" ON "Exercise"("category");

-- CreateIndex
CREATE INDEX "WorkoutPlan_userId_idx" ON "WorkoutPlan"("userId");

-- CreateIndex
CREATE INDEX "WorkoutPlanExercise_planId_idx" ON "WorkoutPlanExercise"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutPlanExercise_planId_orderIndex_key" ON "WorkoutPlanExercise"("planId", "orderIndex");

-- CreateIndex
CREATE INDEX "WorkoutSession_userId_idx" ON "WorkoutSession"("userId");

-- CreateIndex
CREATE INDEX "WorkoutSession_startedAt_idx" ON "WorkoutSession"("startedAt");

-- CreateIndex
CREATE INDEX "SessionExercise_sessionId_idx" ON "SessionExercise"("sessionId");

-- CreateIndex
CREATE INDEX "ExerciseSet_sessionExerciseId_idx" ON "ExerciseSet"("sessionExerciseId");

-- CreateIndex
CREATE INDEX "PersonalRecord_userId_idx" ON "PersonalRecord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalRecord_userId_exerciseId_key" ON "PersonalRecord"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "NutritionLog_userId_idx" ON "NutritionLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionLog_userId_logDate_key" ON "NutritionLog"("userId", "logDate");

-- CreateIndex
CREATE INDEX "NutritionLogItem_logId_idx" ON "NutritionLogItem"("logId");

-- CreateIndex
CREATE UNIQUE INDEX "FoodItem_externalId_key" ON "FoodItem"("externalId");

-- CreateIndex
CREATE INDEX "FoodItem_name_idx" ON "FoodItem"("name");

-- CreateIndex
CREATE INDEX "BodyStat_userId_idx" ON "BodyStat"("userId");

-- CreateIndex
CREATE INDEX "BodyStat_recordedAt_idx" ON "BodyStat"("recordedAt");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanExercise" ADD CONSTRAINT "WorkoutPlanExercise_planId_fkey" FOREIGN KEY ("planId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanExercise" ADD CONSTRAINT "WorkoutPlanExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_planId_fkey" FOREIGN KEY ("planId") REFERENCES "WorkoutPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionExercise" ADD CONSTRAINT "SessionExercise_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionExercise" ADD CONSTRAINT "SessionExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSet" ADD CONSTRAINT "ExerciseSet_sessionExerciseId_fkey" FOREIGN KEY ("sessionExerciseId") REFERENCES "SessionExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionLog" ADD CONSTRAINT "NutritionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionLogItem" ADD CONSTRAINT "NutritionLogItem_logId_fkey" FOREIGN KEY ("logId") REFERENCES "NutritionLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionLogItem" ADD CONSTRAINT "NutritionLogItem_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyStat" ADD CONSTRAINT "BodyStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
