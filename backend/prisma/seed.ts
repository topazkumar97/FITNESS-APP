// prisma/seed.ts
import "dotenv/config";
import {
  PrismaClient,
  MuscleGroup,
  ExerciseCategory,
  Equipment,
} from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const exercises = [
  // ── CHEST ──────────────────────────────────────────────────────
  {
    name: "Barbell Bench Press",
    muscleGroup: MuscleGroup.CHEST,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BARBELL,
    instructions: "Lie on bench, lower bar to chest, press up.",
  },
  {
    name: "Dumbbell Bench Press",
    muscleGroup: MuscleGroup.CHEST,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.DUMBBELL,
    instructions:
      "Same as barbell but with dumbbells for greater range of motion.",
  },
  {
    name: "Incline Barbell Press",
    muscleGroup: MuscleGroup.CHEST,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BARBELL,
    instructions: "Bench at 30-45 degrees, targets upper chest.",
  },
  {
    name: "Cable Fly",
    muscleGroup: MuscleGroup.CHEST,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.CABLE,
    instructions: "Arms wide, bring hands together in arc motion.",
  },
  {
    name: "Push Up",
    muscleGroup: MuscleGroup.CHEST,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BODYWEIGHT,
    instructions: "Hands shoulder-width, lower chest to floor, press up.",
  },

  // ── BACK ───────────────────────────────────────────────────────
  {
    name: "Deadlift",
    muscleGroup: MuscleGroup.BACK,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BARBELL,
    instructions: "Hip hinge, keep back neutral, drive through heels.",
  },
  {
    name: "Pull Up",
    muscleGroup: MuscleGroup.BACK,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BODYWEIGHT,
    instructions: "Hang from bar, pull chest to bar, lower with control.",
  },
  {
    name: "Barbell Row",
    muscleGroup: MuscleGroup.BACK,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BARBELL,
    instructions:
      "Hinge forward, row bar to lower chest, squeeze shoulder blades.",
  },
  {
    name: "Seated Cable Row",
    muscleGroup: MuscleGroup.BACK,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.CABLE,
    instructions: "Sit tall, pull handle to abdomen, hold briefly.",
  },
  {
    name: "Lat Pulldown",
    muscleGroup: MuscleGroup.BACK,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.CABLE,
    instructions: "Pull bar to upper chest, lean slightly back.",
  },
  {
    name: "Single Arm Dumbbell Row",
    muscleGroup: MuscleGroup.BACK,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.DUMBBELL,
    instructions: "Brace on bench, pull dumbbell to hip.",
  },

  // ── SHOULDERS ──────────────────────────────────────────────────
  {
    name: "Overhead Press",
    muscleGroup: MuscleGroup.SHOULDERS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BARBELL,
    instructions: "Press bar from shoulders to lockout overhead.",
  },
  {
    name: "Dumbbell Lateral Raise",
    muscleGroup: MuscleGroup.SHOULDERS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.DUMBBELL,
    instructions: "Raise arms to sides to shoulder height, control down.",
  },
  {
    name: "Dumbbell Shoulder Press",
    muscleGroup: MuscleGroup.SHOULDERS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.DUMBBELL,
    instructions: "Press dumbbells from ear height to lockout.",
  },
  {
    name: "Face Pull",
    muscleGroup: MuscleGroup.SHOULDERS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.CABLE,
    instructions: "Pull rope to face, elbows high, externally rotate.",
  },
  {
    name: "Front Raise",
    muscleGroup: MuscleGroup.SHOULDERS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.DUMBBELL,
    instructions: "Raise dumbbells in front to shoulder height.",
  },

  // ── BICEPS ─────────────────────────────────────────────────────
  {
    name: "Barbell Curl",
    muscleGroup: MuscleGroup.BICEPS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BARBELL,
    instructions: "Curl bar from hips to shoulders, elbows stationary.",
  },
  {
    name: "Dumbbell Hammer Curl",
    muscleGroup: MuscleGroup.BICEPS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.DUMBBELL,
    instructions: "Neutral grip, curl to shoulder, targets brachialis.",
  },
  {
    name: "Incline Dumbbell Curl",
    muscleGroup: MuscleGroup.BICEPS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.DUMBBELL,
    instructions: "On incline bench, full stretch at bottom.",
  },
  {
    name: "Cable Curl",
    muscleGroup: MuscleGroup.BICEPS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.CABLE,
    instructions: "Constant tension curl with cable.",
  },

  // ── TRICEPS ────────────────────────────────────────────────────
  {
    name: "Close Grip Bench Press",
    muscleGroup: MuscleGroup.TRICEPS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BARBELL,
    instructions: "Hands shoulder-width, elbows tucked, tricep focus.",
  },
  {
    name: "Tricep Pushdown",
    muscleGroup: MuscleGroup.TRICEPS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.CABLE,
    instructions: "Push rope or bar down, fully extend arms.",
  },
  {
    name: "Overhead Tricep Extension",
    muscleGroup: MuscleGroup.TRICEPS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.DUMBBELL,
    instructions: "Hold dumbbell overhead, lower behind head, extend.",
  },
  {
    name: "Skull Crusher",
    muscleGroup: MuscleGroup.TRICEPS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BARBELL,
    instructions: "Lower bar to forehead, press back up.",
  },
  {
    name: "Dips",
    muscleGroup: MuscleGroup.TRICEPS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BODYWEIGHT,
    instructions: "On parallel bars, lower until shoulders below elbows.",
  },

  // ── CORE ───────────────────────────────────────────────────────
  {
    name: "Plank",
    muscleGroup: MuscleGroup.CORE,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BODYWEIGHT,
    instructions: "Forearms on floor, body straight, hold position.",
  },
  {
    name: "Cable Crunch",
    muscleGroup: MuscleGroup.CORE,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.CABLE,
    instructions: "Kneel, pull rope down, crunch abs.",
  },
  {
    name: "Hanging Leg Raise",
    muscleGroup: MuscleGroup.CORE,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BODYWEIGHT,
    instructions: "Hang from bar, raise legs to 90 degrees.",
  },
  {
    name: "Ab Wheel Rollout",
    muscleGroup: MuscleGroup.CORE,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.OTHER,
    instructions: "Roll out from knees, extend fully, roll back.",
  },
  {
    name: "Russian Twist",
    muscleGroup: MuscleGroup.CORE,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BODYWEIGHT,
    instructions: "Seated, rotate torso side to side.",
  },

  // ── QUADS ──────────────────────────────────────────────────────
  {
    name: "Barbell Squat",
    muscleGroup: MuscleGroup.QUADS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BARBELL,
    instructions: "Bar on traps, squat to parallel, drive up through heels.",
  },
  {
    name: "Leg Press",
    muscleGroup: MuscleGroup.QUADS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.MACHINE,
    instructions: "Press platform away, don't lock knees at top.",
  },
  {
    name: "Hack Squat",
    muscleGroup: MuscleGroup.QUADS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.MACHINE,
    instructions: "On hack squat machine, lower until 90 degrees.",
  },
  {
    name: "Leg Extension",
    muscleGroup: MuscleGroup.QUADS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.MACHINE,
    instructions: "Extend legs to lockout, squeeze quads.",
  },
  {
    name: "Bulgarian Split Squat",
    muscleGroup: MuscleGroup.QUADS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.DUMBBELL,
    instructions: "Rear foot elevated, lower front knee to floor.",
  },

  // ── HAMSTRINGS ─────────────────────────────────────────────────
  {
    name: "Romanian Deadlift",
    muscleGroup: MuscleGroup.HAMSTRINGS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BARBELL,
    instructions: "Hinge at hips, slight knee bend, feel hamstring stretch.",
  },
  {
    name: "Leg Curl",
    muscleGroup: MuscleGroup.HAMSTRINGS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.MACHINE,
    instructions: "Curl legs toward glutes, squeeze at top.",
  },
  {
    name: "Nordic Curl",
    muscleGroup: MuscleGroup.HAMSTRINGS,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BODYWEIGHT,
    instructions: "Kneel, feet anchored, lower body to floor using hamstrings.",
  },

  // ── GLUTES ─────────────────────────────────────────────────────
  {
    name: "Hip Thrust",
    muscleGroup: MuscleGroup.GLUTES,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BARBELL,
    instructions: "Upper back on bench, drive hips up, squeeze glutes at top.",
  },
  {
    name: "Cable Kickback",
    muscleGroup: MuscleGroup.GLUTES,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.CABLE,
    instructions: "Kick leg back, squeeze glute at top.",
  },
  {
    name: "Glute Bridge",
    muscleGroup: MuscleGroup.GLUTES,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.BODYWEIGHT,
    instructions: "Lie on back, drive hips up, hold at top.",
  },

  // ── CALVES ─────────────────────────────────────────────────────
  {
    name: "Standing Calf Raise",
    muscleGroup: MuscleGroup.CALVES,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.MACHINE,
    instructions: "Full range of motion, stretch at bottom, squeeze at top.",
  },
  {
    name: "Seated Calf Raise",
    muscleGroup: MuscleGroup.CALVES,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.MACHINE,
    instructions: "Knees at 90 degrees, targets soleus.",
  },

  // ── CARDIO ─────────────────────────────────────────────────────
  {
    name: "Treadmill Run",
    muscleGroup: MuscleGroup.CARDIO,
    category: ExerciseCategory.CARDIO,
    equipment: Equipment.MACHINE,
    instructions: "Set pace and incline, maintain form.",
  },
  {
    name: "Rowing Machine",
    muscleGroup: MuscleGroup.FULL_BODY,
    category: ExerciseCategory.CARDIO,
    equipment: Equipment.MACHINE,
    instructions: "Drive with legs first, then pull with arms.",
  },
  {
    name: "Jump Rope",
    muscleGroup: MuscleGroup.CARDIO,
    category: ExerciseCategory.CARDIO,
    equipment: Equipment.OTHER,
    instructions: "Stay on balls of feet, keep jumps small.",
  },
  {
    name: "Burpee",
    muscleGroup: MuscleGroup.FULL_BODY,
    category: ExerciseCategory.PLYOMETRIC,
    equipment: Equipment.BODYWEIGHT,
    instructions: "Squat down, jump feet back, push up, jump up.",
  },
  {
    name: "Kettlebell Swing",
    muscleGroup: MuscleGroup.FULL_BODY,
    category: ExerciseCategory.STRENGTH,
    equipment: Equipment.KETTLEBELL,
    instructions:
      "Hip hinge, drive hips forward, swing kettlebell to shoulder height.",
  },
];

async function main() {
  console.log("Seeding exercise library...");

  // WHY upsert: if we run the seed again it won't create duplicates.
  // name is our natural unique key for exercises.
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name } as any,
      update: {}, // don't overwrite if already exists
      create: {
        ...exercise,
        isCustom: false, // all seeded exercises are global library items
      },
    });
  }

  console.log(`Seeded ${exercises.length} exercises successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
