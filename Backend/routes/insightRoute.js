import express from "express";
import {
  getInsights,
  generateInsight,
} from "../controllers/insightController.js";
import { protect } from "../middleware/authMiddleware.js";
import { insightLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.use(protect);

router.get("/", getInsights);
router.post("/generate", insightLimiter, generateInsight);

export default router;