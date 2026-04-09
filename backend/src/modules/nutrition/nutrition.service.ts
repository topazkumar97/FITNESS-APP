// src/modules/nutrition/nutrition.service.ts
import { prisma } from "../../utils/prisma";
import { MealType } from "../../generated/prisma";

// ─── FOOD SEARCH ─────────────────────────────────────────────────────────────

export const searchFood = async (query: string) => {
  const cached = await prisma.foodItem.findMany({
    where: { name: { contains: query, mode: "insensitive" } },
    take: 20,
    orderBy: { name: "asc" },
  });

  if (cached.length > 0) return { source: "cache", results: cached };

  // WHY native fetch: Node 18+ ships this built-in.
  // No dependency, no supply chain risk, same API as the browser.
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: "20",
    fields: "product_name,brands,nutriments,serving_size,serving_quantity",
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  let products: any[] = [];
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?${params}`,
      { signal: controller.signal },
    );
    const data = (await response.json()) as any;
    products = data?.products ?? [];
  } finally {
    clearTimeout(timeout);
  }

  const validProducts = products.filter(
    (p: any) =>
      p.product_name && p.nutriments?.["energy-kcal_serving"] !== undefined,
  );

  const saved = await Promise.all(
    validProducts.slice(0, 10).map((p: any) =>
      prisma.foodItem
        .upsert({
          where: { externalId: p._id ?? p.product_name },
          update: {},
          create: {
            externalId: p._id ?? p.product_name,
            name: p.product_name,
            brand: p.brands ?? null,
            calories: p.nutriments["energy-kcal_serving"] ?? 0,
            proteinG: p.nutriments["proteins_serving"] ?? 0,
            carbsG: p.nutriments["carbohydrates_serving"] ?? 0,
            fatG: p.nutriments["fat_serving"] ?? 0,
            fiberG: p.nutriments["fiber_serving"] ?? null,
            servingSize: p.serving_quantity ?? 100,
            servingUnit: "g",
          },
        })
        .catch(() => null),
    ),
  );

  return { source: "api", results: saved.filter(Boolean) };
};

export const searchByBarcode = async (barcode: string) => {
  const cached = await prisma.foodItem.findUnique({
    where: { externalId: barcode },
  });
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  let p: any;
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { signal: controller.signal },
    );
    const data = (await response.json()) as any;
    if (!data?.product || data.status === 0) {
      throw new Error("Product not found for this barcode");
    }
    p = data.product;
  } finally {
    clearTimeout(timeout);
  }

  return prisma.foodItem.upsert({
    where: { externalId: barcode },
    update: {},
    create: {
      externalId: barcode,
      name: p.product_name ?? "Unknown product",
      brand: p.brands ?? null,
      calories: p.nutriments?.["energy-kcal_serving"] ?? 0,
      proteinG: p.nutriments?.["proteins_serving"] ?? 0,
      carbsG: p.nutriments?.["carbohydrates_serving"] ?? 0,
      fatG: p.nutriments?.["fat_serving"] ?? 0,
      fiberG: p.nutriments?.["fiber_serving"] ?? null,
      servingSize: p.serving_quantity ?? 100,
      servingUnit: "g",
    },
  });
};

// ─── NUTRITION LOG ────────────────────────────────────────────────────────────

// WHY: we parse the date from the URL string and normalize it to
// midnight UTC so "2024-03-15" always maps to the same DB record
// regardless of what timezone the user is in.
const parseLogDate = (dateStr: string): Date => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime()))
    throw new Error("Invalid date format. Use YYYY-MM-DD");
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

export const getOrCreateLog = async (userId: string, dateStr: string) => {
  const logDate = parseLogDate(dateStr);

  // upsert: get existing log or create empty one
  return prisma.nutritionLog.upsert({
    where: { userId_logDate: { userId, logDate } },
    update: {},
    create: { userId, logDate },
    include: {
      items: {
        include: { foodItem: true },
        orderBy: { loggedAt: "asc" },
      },
    },
  });
};

export const getDailyLog = async (userId: string, dateStr: string) => {
  const logDate = parseLogDate(dateStr);

  const log = await prisma.nutritionLog.findUnique({
    where: { userId_logDate: { userId, logDate } },
    include: {
      items: {
        include: { foodItem: true },
        orderBy: { loggedAt: "asc" },
      },
    },
  });

  if (!log) {
    return {
      logDate,
      items: [],
      summary: buildSummary([], null),
    };
  }

  // Get user's calorie target from their profile
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { weightKg: true, goal: true },
  });

  return {
    ...log,
    summary: buildSummary(log.items, log.targetCalories),
  };
};

// WHY: calculate macros server-side, not client-side.
// quantity is the number of servings. macros are per serving.
// So total protein = foodItem.proteinG * quantity
const buildSummary = (items: any[], targetCalories: number | null) => {
  const totals = items.reduce(
    (acc, item) => {
      const qty = item.quantity;
      acc.calories += item.foodItem.calories * qty;
      acc.proteinG += item.foodItem.proteinG * qty;
      acc.carbsG += item.foodItem.carbsG * qty;
      acc.fatG += item.foodItem.fatG * qty;
      acc.fiberG += (item.foodItem.fiberG ?? 0) * qty;
      return acc;
    },
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 },
  );

  // Round to 1 decimal place — nobody needs 6 decimal places on their macros
  Object.keys(totals).forEach((key) => {
    totals[key as keyof typeof totals] =
      Math.round(totals[key as keyof typeof totals] * 10) / 10;
  });

  // Group items by meal type for the UI breakdown
  const byMeal = items.reduce((acc: any, item) => {
    if (!acc[item.mealType]) acc[item.mealType] = [];
    acc[item.mealType].push(item);
    return acc;
  }, {});

  return {
    totals,
    remaining: targetCalories
      ? Math.round(targetCalories - totals.calories)
      : null,
    targetCalories,
    byMeal,
  };
};

export const addFoodToLog = async (
  userId: string,
  dateStr: string,
  data: {
    foodItemId: string;
    mealType: MealType;
    quantity: number;
  },
) => {
  const logDate = parseLogDate(dateStr);

  // Get or create the log for this date
  const log = await prisma.nutritionLog.upsert({
    where: { userId_logDate: { userId, logDate } },
    update: {},
    create: { userId, logDate },
  });

  // Verify the food item exists
  const foodItem = await prisma.foodItem.findUnique({
    where: { id: data.foodItemId },
  });
  if (!foodItem) throw new Error("Food item not found");

  const item = await prisma.nutritionLogItem.create({
    data: {
      logId: log.id,
      foodItemId: data.foodItemId,
      mealType: data.mealType,
      quantity: data.quantity,
    },
    include: { foodItem: true },
  });

  return item;
};

export const removeFoodFromLog = async (itemId: string, userId: string) => {
  // Verify ownership before deleting
  const item = await prisma.nutritionLogItem.findUnique({
    where: { id: itemId },
    include: { log: true },
  });

  if (!item) throw new Error("Item not found");
  if (item.log.userId !== userId) throw new Error("FORBIDDEN");

  await prisma.nutritionLogItem.delete({ where: { id: itemId } });
};

export const setCalorieTarget = async (
  userId: string,
  dateStr: string,
  targetCalories: number,
) => {
  const logDate = parseLogDate(dateStr);

  return prisma.nutritionLog.upsert({
    where: { userId_logDate: { userId, logDate } },
    update: { targetCalories },
    create: { userId, logDate, targetCalories },
  });
};

// ─── BODY STATS ───────────────────────────────────────────────────────────────

export const logBodyStat = async (
  userId: string,
  data: {
    weightKg?: number;
    bodyFatPct?: number;
    muscleMassKg?: number;
  },
) => {
  return prisma.bodyStat.create({
    data: { userId, ...data },
  });
};

export const getBodyStats = async (userId: string) => {
  return prisma.bodyStat.findMany({
    where: { userId },
    orderBy: { recordedAt: "desc" },
    take: 90, // last 90 days is enough for charts
  });
};
