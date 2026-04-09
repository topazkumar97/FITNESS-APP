// src/modules/nutrition/nutrition.routes.ts
import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  foodSearch,
  barcodeSearch,
  getDayLog,
  addFood,
  removeFood,
  updateCalorieTarget,
  addBodyStat,
  fetchBodyStats,
} from "./nutrition.controller";

const nutritionRouter = new Hono();

nutritionRouter.use("*", authMiddleware);

// Food search
nutritionRouter.get("/food/search", foodSearch);
nutritionRouter.get("/food/barcode/:barcode", barcodeSearch);

// Daily log
nutritionRouter.get("/log/:date", getDayLog);
nutritionRouter.post("/log/:date/item", addFood);
nutritionRouter.delete("/log/item/:itemId", removeFood);
nutritionRouter.patch("/log/:date/target", updateCalorieTarget);

// Body stats
nutritionRouter.post("/bodystats", addBodyStat);
nutritionRouter.get("/bodystats", fetchBodyStats);

export default nutritionRouter;
