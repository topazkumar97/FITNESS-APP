// src/modules/nutrition/nutrition.controller.ts
import { Context } from "hono";
import {
  searchFood,
  searchByBarcode,
  getDailyLog,
  addFoodToLog,
  removeFoodFromLog,
  setCalorieTarget,
  logBodyStat,
  getBodyStats,
} from "./nutrition.service";
import { MealType } from "../../generated/prisma";

const getUser = (c: Context): { userId: string } =>
  c.get("user") as { userId: string };

export const foodSearch = async (c: Context) => {
  try {
    const q = c.req.query("q");
    if (!q || q.trim().length < 2) {
      return c.json(
        { error: "Search query must be at least 2 characters" },
        400,
      );
    }
    const result = await searchFood(q.trim());
    return c.json(result);
  } catch (e) {
    console.error("Food search error:", e);
    return c.json({ error: "Food search failed" }, 500);
  }
};

export const barcodeSearch = async (c: Context) => {
  try {
    const barcode = c.req.param("barcode");
    if (!barcode) {
      return c.json({ error: "Barcode parameter is required" }, 400);
    }
    const result = await searchByBarcode(barcode);
    return c.json(result);
  } catch (e) {
    if ((e as Error).message === "Product not found for this barcode") {
      return c.json({ error: (e as Error).message }, 404);
    }
    return c.json({ error: "Barcode lookup failed" }, 500);
  }
};

export const getDayLog = async (c: Context) => {
  try {
    const { userId } = getUser(c);
    const date = c.req.param("date");
    if (!date) {
      return c.json({ error: "Date parameter is required" }, 400);
    }
    const log = await getDailyLog(userId, date);
    return c.json(log);
  } catch (e) {
    if ((e as Error).message.includes("Invalid date")) {
      return c.json({ error: (e as Error).message }, 400);
    }
    return c.json({ error: "Failed to fetch nutrition log" }, 500);
  }
};

export const addFood = async (c: Context) => {
  try {
    const { userId } = getUser(c);
    const date = c.req.param("date");
    if (!date) {
      return c.json({ error: "Date parameter is required" }, 400);
    }
    const { foodItemId, mealType, quantity } = await c.req.json();

    if (!foodItemId || !mealType || !quantity) {
      return c.json(
        { error: "foodItemId, mealType, and quantity are required" },
        400,
      );
    }

    // Validate mealType is a valid enum value
    if (!Object.values(MealType).includes(mealType)) {
      return c.json(
        {
          error: `mealType must be one of: ${Object.values(MealType).join(", ")}`,
        },
        400,
      );
    }

    if (quantity <= 0) {
      return c.json({ error: "quantity must be greater than 0" }, 400);
    }

    const item = await addFoodToLog(userId, date, {
      foodItemId,
      mealType,
      quantity,
    });
    return c.json(item, 201);
  } catch (e) {
    if ((e as Error).message === "Food item not found") {
      return c.json({ error: (e as Error).message }, 404);
    }
    return c.json({ error: "Failed to log food" }, 500);
  }
};

export const removeFood = async (c: Context) => {
  try {
    const { userId } = getUser(c);
    const itemId = c.req.param("itemId");
    if (!itemId) {
      return c.json({ error: "Item ID parameter is required" }, 400);
    }
    await removeFoodFromLog(itemId, userId);
    return c.json({ message: "Food item removed" });
  } catch (e) {
    if ((e as Error).message === "FORBIDDEN") {
      return c.json({ error: "Forbidden" }, 403);
    }
    if ((e as Error).message === "Item not found") {
      return c.json({ error: "Item not found" }, 404);
    }
    return c.json({ error: "Failed to remove food item" }, 500);
  }
};

export const updateCalorieTarget = async (c: Context) => {
  try {
    const { userId } = getUser(c);
    const date = c.req.param("date");
    if (!date) {
      return c.json({ error: "Date parameter is required" }, 400);
    }
    const { targetCalories } = await c.req.json();
    if (!targetCalories || targetCalories <= 0) {
      return c.json({ error: "targetCalories must be a positive number" }, 400);
    }
    const log = await setCalorieTarget(userId, date, targetCalories);
    return c.json(log);
  } catch (e) {
    return c.json({ error: "Failed to update calorie target" }, 500);
  }
};

export const addBodyStat = async (c: Context) => {
  try {
    const { userId } = getUser(c);
    const body = await c.req.json();
    const { weightKg, bodyFatPct, muscleMassKg } = body;

    if (!weightKg && !bodyFatPct && !muscleMassKg) {
      return c.json(
        {
          error:
            "At least one of weightKg, bodyFatPct, or muscleMassKg is required",
        },
        400,
      );
    }

    const stat = await logBodyStat(userId, {
      weightKg,
      bodyFatPct,
      muscleMassKg,
    });
    return c.json(stat, 201);
  } catch (e) {
    return c.json({ error: "Failed to log body stat" }, 500);
  }
};

export const fetchBodyStats = async (c: Context) => {
  try {
    const { userId } = getUser(c);
    const stats = await getBodyStats(userId);
    return c.json(stats);
  } catch (e) {
    return c.json({ error: "Failed to fetch body stats" }, 500);
  }
};
