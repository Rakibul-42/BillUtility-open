import express from "express";
import { globalSearch } from "../controllers/searchController.js";
import { protect } from "../middleware/authMiddleware.js";
import { searchLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.use(protect);
router.get("/", searchLimiter, globalSearch);

export default router;
